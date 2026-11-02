import { Assets, Container, Graphics, Mesh, MeshGeometry, Rectangle, Texture } from 'pixi.js';
import { TILE_CONFIG, TILE_TYPES } from './mapData';
import { ISO_TILE_H, ISO_TILE_W, VIEW_HEIGHT, VIEW_WIDTH, depthOf, rotateTile, tileToIso, unrotateTile } from './iso';

const FLOOR_TEXTURE = '/room/floorboards.png';
// The floorboard art is a seamless square with a transparent margin; each tile
// samples one cell of a FLOOR_GRID x FLOOR_GRID split so neighbouring tiles
// line up into continuous planks.
const FLOOR_MARGIN = 24;
const FLOOR_GRID = 4;

const WALL_FLAT = '/room/wall-flat.png';

type Point = [number, number];
// Four texture-space corners (pixels): top-left, top-right, bottom-right, bottom-left.
type UvQuad = [Point, Point, Point, Point];

// Opaque regions of the wall art, measured from the PNGs. wall-flat is a
// front-on elevation, warped onto each wall face.
// Inset from the art's left/right edges: the edge pixels are partly transparent
// and would show as a seam between neighbouring panels.
const FLAT_INSET = 8;
const UV_FLAT: UvQuad = [[97 + FLAT_INSET, 61], [754 - FLAT_INSET, 61], [754 - FLAT_INSET, 705], [97 + FLAT_INSET, 705]];

const FACE_OVERLAP = 0.75;

const WALL_TOP_COLOR = 0xd9c7b5;
const RIGHT_FACE_TINT = 0xd6cdc4;

// Walls on the near (front) edges are kept low so they don't hide the room.
const NEAR_WALL_HEIGHT = 12;

// Wall thickness as a fraction of a tile (0 = paper thin, 1 = full tile).
const WALL_THICKNESS = 0.25;

const HALF_W = ISO_TILE_W / 2;
const HALF_H = ISO_TILE_H / 2;

// Diamond corners, relative to the tile's top vertex (the tile's origin).
const TOP: Point = [0, 0];
const RIGHT: Point = [HALF_W, HALF_H];
const BOTTOM: Point = [0, ISO_TILE_H];
const LEFT: Point = [-HALF_W, HALF_H];

function shade(color: number, factor: number): number {
  const r = Math.round(((color >> 16) & 0xff) * factor);
  const g = Math.round(((color >> 8) & 0xff) * factor);
  const b = Math.round((color & 0xff) * factor);
  return (r << 16) | (g << 8) | b;
}

const flatten = (points: Point[]): number[] => points.flatMap(([x, y]) => [x, y]);
const lift = ([x, y]: Point, height: number): Point => [x, y - height];

export class TileMap {
  private floorLayer = new Container();
  private blocks: Container[] = [];
  private mapData: number[][];
  private floorTextures: Texture[] = [];
  private wallFlat: Texture | null = null;

  constructor(mapData: number[][]) {
    this.mapData = mapData;
  }

  // Loads the room art. Must be awaited before render().
  async load(): Promise<void> {
    const [floor, flat] = await Promise.all([
      Assets.load<Texture>(FLOOR_TEXTURE),
      Assets.load<Texture>(WALL_FLAT),
    ]);
    this.wallFlat = flat;

    floor.source.scaleMode = 'nearest';
    const cell = (floor.width - FLOOR_MARGIN * 2) / FLOOR_GRID;
    this.floorTextures = [];
    for (let row = 0; row < FLOOR_GRID; row++) {
      for (let col = 0; col < FLOOR_GRID; col++) {
        this.floorTextures.push(
          new Texture({
            source: floor.source,
            frame: new Rectangle(FLOOR_MARGIN + col * cell, FLOOR_MARGIN + row * cell, cell, cell),
          }),
        );
      }
    }
  }

  // Flat tiles go in the returned floor layer; raised tiles (walls, furniture)
  // are exposed via getBlocks() so they can be depth-sorted with entities.
  render(): Container {
    this.floorLayer.removeChildren();
    this.blocks = [];

    for (let row = 0; row < this.mapData.length; row++) {
      for (let col = 0; col < this.mapData[row].length; col++) {
        const tileType = this.mapData[row][col];
        const { x, y } = tileToIso(col, row);
        const height = this.getTileHeight(col, row);

        if (height > 0) {
          const block = this.createBlock(tileType, height, col, row);
          block.position.set(x, y);
          block.zIndex = depthOf(col, row);
          this.blocks.push(block);
        } else {
          const tile = this.createFloorTile(tileType, col, row);
          tile.position.set(x, y);
          this.floorLayer.addChild(tile);
        }
      }
    }

    return this.floorLayer;
  }

  getBlocks(): Container[] {
    return this.blocks;
  }

  getContainer(): Container {
    return this.floorLayer;
  }

  // Height in pixels of the tile's raised surface (0 for flat floor), used to
  // lift plants that sit on tables, ledges and window sills.
  getTileHeight(tileX: number, tileY: number): number {
    if (!this.inBounds(tileX, tileY)) return 0;
    const tileType = this.mapData[tileY][tileX];
    const height = TILE_CONFIG[tileType]?.height ?? 0;
    const view = rotateTile(tileX, tileY);
    if (tileType === TILE_TYPES.WALL && (view.y === VIEW_HEIGHT - 1 || view.x === VIEW_WIDTH - 1)) {
      return NEAR_WALL_HEIGHT;
    }
    return height;
  }

  private createFloorTile(tileType: number, col: number, row: number): Container {
    if (tileType === TILE_TYPES.WOODEN_FLOOR && this.floorTextures.length > 0) {
      // Index by view coordinates so planks stay continuous whatever VIEW_ROTATION is.
      const view = rotateTile(col, row);
      const gx = view.x % FLOOR_GRID;
      const gy = view.y % FLOOR_GRID;
      const texture = this.floorTextures[gy * FLOOR_GRID + gx];
      const geometry = new MeshGeometry({
        positions: new Float32Array(flatten([TOP, RIGHT, BOTTOM, LEFT])),
        uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
        indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
      });
      return new Mesh({ geometry, texture });
    }

    const color = TILE_CONFIG[tileType]?.color ?? 0xcccccc;
    return new Graphics().poly(flatten([TOP, RIGHT, BOTTOM, LEFT])).fill(color);
  }

  private isOnNearEdge(col: number, row: number): boolean {
    const { x, y } = rotateTile(col, row);
    return y === VIEW_HEIGHT - 1 || x === VIEW_WIDTH - 1;
  }

  private createBlock(tileType: number, height: number, col: number, row: number): Container {
    const isWall = tileType === TILE_TYPES.WALL;
    const isTallWall = isWall && height === TILE_CONFIG[TILE_TYPES.WALL].height;
    const isWallInset = tileType === TILE_TYPES.WINDOW || tileType === TILE_TYPES.LEDGE;
    const color = isWall ? WALL_TOP_COLOR : (TILE_CONFIG[tileType]?.color ?? 0xcccccc);
    const block = new Container();

    if (isTallWall && this.wallFlat) {
      this.buildTallWall(block, col, row, height, color);
    } else if (isWall || (isWallInset && this.isOnNearEdge(col, row))) {
      this.buildNearWall(block, col, row, height, color);
    } else {
      this.addPrism(block, height, color);
    }
    return block;
  }

  // Tile-local (u, v) -> screen offset from the tile's top vertex. u runs
  // down-right and v runs down-left; (0,0) is the back corner of the tile.
  private p(u: number, v: number): Point {
    return [(u - v) * HALF_W, (u + v) * HALF_H];
  }

  private quad(a: Point, b: Point, height: number, color: number, container: Container): void {
    container.addChild(new Graphics().poly(flatten([lift(a, height), lift(b, height), b, a])).fill(color));
  }

  // Flat-coloured full-tile prism: cap plus the two camera-facing sides.
  private addPrism(block: Container, height: number, color: number): void {
    this.quad(this.p(0, 1), this.p(1, 1), height, shade(color, 0.7), block);
    this.quad(this.p(1, 1), this.p(1, 0), height, shade(color, 0.5), block);
    const cap = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([u, v]) => lift(this.p(u, v), height));
    block.addChild(new Graphics().poly(flatten(cap)).fill(color));
  }

  // Low front walls: a thin slab along the room-side (back) edge of the tile.
  // Their outer faces point at the camera.
  private buildNearWall(block: Container, col: number, row: number, height: number, color: number): void {
    const { x: vx, y: vy } = rotateTile(col, row);
    const t = WALL_THICKNESS;
    const nearBottom = vy === VIEW_HEIGHT - 1;
    const nearRight = vx === VIEW_WIDTH - 1;
    const left = shade(color, 0.7);
    const right = shade(color, 0.5);

    let cap: Array<[number, number]>;
    if (nearBottom && nearRight) {
      cap = [[0, 0], [t, 0], [t, t], [0, t]];
      this.quad(this.p(0, t), this.p(t, t), height, left, block);
      this.quad(this.p(t, t), this.p(t, 0), height, right, block);
    } else if (nearBottom) {
      // The tall wall ends at this tile's inner edge, so don't run past it.
      const u0 = vx === 0 ? 1 - t : 0;
      cap = [[u0, 0], [1, 0], [1, t], [u0, t]];
      this.quad(this.p(u0, t), this.p(1, t), height, left, block);
      this.quad(this.p(1, t), this.p(1, 0), height, right, block);
    } else {
      const v0 = vy === 0 ? 1 - t : 0;
      cap = [[0, v0], [t, v0], [t, 1], [0, 1]];
      this.quad(this.p(0, 1), this.p(t, 1), height, left, block);
      this.quad(this.p(t, 1), this.p(t, v0), height, right, block);
    }
    block.addChild(new Graphics().poly(flatten(cap.map(([u, v]) => lift(this.p(u, v), height)))).fill(color));
  }

  // Is the view-space tile a wall? Off the map counts as wall so runs that
  // reach the edge don't get an end cap.
  private isWallAtView(viewX: number, viewY: number): boolean {
    if (viewX < 0 || viewY < 0 || viewX >= VIEW_WIDTH || viewY >= VIEW_HEIGHT) return true;
    const { tileX, tileY } = unrotateTile(viewX, viewY);
    return this.mapData[tileY][tileX] === TILE_TYPES.WALL;
  }

  private isWallInMap(viewX: number, viewY: number): boolean {
    if (viewX < 0 || viewY < 0 || viewX >= VIEW_WIDTH || viewY >= VIEW_HEIGHT) return false;
    return this.isWallAtView(viewX, viewY);
  }

  // A tile is the outer corner of the room when walls continue along both
  // axes but the diagonal tile is open floor.
  private isCornerTile(vx: number, vy: number): boolean {
    return this.isWallAtView(vx, vy) && this.isWallInMap(vx + 1, vy) && this.isWallInMap(vx, vy + 1) && !this.isWallAtView(vx + 1, vy + 1);
  }

  // Tall back walls are thin slabs along the room-facing (front) edge of their
  // tile. Row walls run along u with their face at v=1, column walls along v
  // with their face at u=1. The corner tile is just the small square where
  // the two slabs meet, so two flat panels form the inside corner.
  private buildTallWall(block: Container, col: number, row: number, height: number, color: number): void {
    const { x: vx, y: vy } = rotateTile(col, row);
    const wall = (x: number, y: number) => this.isWallAtView(x, y);
    // Low front walls count as open ends, so tall runs get the same end face as at a doorway.
    const tall = (x: number, y: number) => wall(x, y) && x < VIEW_WIDTH - 1 && y < VIEW_HEIGHT - 1;
    const t = WALL_THICKNESS;
    const s = 1 - t;

    const frontY = !wall(vx, vy + 1);
    const frontX = !wall(vx + 1, vy);
    const isCorner = this.isCornerTile(vx, vy);

    const hasRow = this.isWallInMap(vx - 1, vy) || this.isWallInMap(vx + 1, vy);
    const hasCol = this.isWallInMap(vx, vy - 1) || this.isWallInMap(vx, vy + 1);
    const isRow = !isCorner && (hasRow !== hasCol ? hasRow : frontY);
    const isColumn = !isCorner && !isRow && frontX;

    const faceLeft = (u0: number, u1: number, art: { texture: Texture; uv: UvQuad }) =>
      this.createFace(this.p(u0, 1), this.p(u1, 1), height, art, 0xffffff);
    const faceRight = (v0: number, v1: number, art: { texture: Texture; uv: UvQuad }) =>
      this.createFace(this.p(1, v0), this.p(1, v1), height, art, RIGHT_FACE_TINT);

    let cap: Array<[number, number]>;
    if (isCorner) {
      cap = [[s, s], [1, s], [1, 1], [s, 1]];
      block.addChild(
        this.createFace(this.p(s, 1), this.p(1, 1), height, { texture: this.wallFlat!, uv: UV_FLAT }, 0xffffff),
        this.createFace(this.p(1, 1), this.p(1, s), height, { texture: this.wallFlat!, uv: UV_FLAT }, RIGHT_FACE_TINT),
      );
    } else if (isRow) {
      cap = [[0, s], [1, s], [1, 1], [0, 1]];
      block.addChild(faceLeft(0, 1, this.pickArt()));
      if (!tall(vx + 1, vy)) this.quad(this.p(1, 1), this.p(1, s), height, shade(color, 0.5), block);
    } else if (isColumn) {
      cap = [[s, 0], [1, 0], [1, 1], [s, 1]];
      block.addChild(faceRight(1, 0, this.pickArt()));
      if (!tall(vx, vy + 1)) this.quad(this.p(s, 1), this.p(1, 1), height, shade(color, 0.7), block);
    } else {
      // Interior wall with no room-facing side.
      return;
    }

    block.addChild(new Graphics().poly(flatten(cap.map(([u, v]) => lift(this.p(u, v), height)))).fill(color));
  }

  private pickArt(): { texture: Texture; uv: UvQuad } {
    return { texture: this.wallFlat!, uv: UV_FLAT };
  }

  // A vertical wall face standing on the edge from `a` (left) to `b` (right).
  private createFace(a: Point, b: Point, height: number, art: { texture: Texture; uv: UvQuad }, tint: number): Mesh {
    const { texture, uv } = art;
    // Overlap neighbours by a fraction of a pixel so no gap shows between faces.
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const e = FACE_OVERLAP / len;
    const a2: Point = [a[0] - dx * e, a[1] - dy * e];
    const b2: Point = [b[0] + dx * e, b[1] + dy * e];
    const geometry = new MeshGeometry({
      positions: new Float32Array(flatten([lift(a2, height), lift(b2, height), b2, a2])),
      uvs: new Float32Array(uv.flatMap(([u, v]) => [u / texture.width, v / texture.height])),
      indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
    });
    const mesh = new Mesh({ geometry, texture });
    mesh.tint = tint;
    return mesh;
  }

  private inBounds(tileX: number, tileY: number): boolean {
    return tileY >= 0 && tileY < this.mapData.length && tileX >= 0 && tileX < this.mapData[tileY].length;
  }

  isWalkable(tileX: number, tileY: number): boolean {
    if (!this.inBounds(tileX, tileY)) return false;
    return TILE_CONFIG[this.mapData[tileY][tileX]]?.walkable ?? false;
  }

  isPlantable(tileX: number, tileY: number): boolean {
    if (!this.inBounds(tileX, tileY)) return false;
    return TILE_CONFIG[this.mapData[tileY][tileX]]?.plantable ?? true;
  }
}
