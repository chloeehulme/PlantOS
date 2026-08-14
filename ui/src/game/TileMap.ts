import { Container, Graphics } from 'pixi.js';
import { TILE_SIZE, TILE_CONFIG, TILE_TYPES } from './mapData';

interface TileConnections {
  left: boolean;
  right: boolean;
  above: boolean;
  below: boolean;
}

export class TileMap {
  private container: Container;
  private mapData: number[][];
  private tileSize: number;

  constructor(mapData: number[][], tileSize: number = TILE_SIZE) {
    this.mapData = mapData;
    this.tileSize = tileSize;
    this.container = new Container();
  }

  private getTileConnections(
  row: number,
  col: number,
  tileType: number,
): TileConnections {
    return {
      left: this.isSameTile(row, col - 1, tileType),
      right: this.isSameTile(row, col + 1, tileType),
      above: this.isSameTile(row - 1, col, tileType),
      below: this.isSameTile(row + 1, col, tileType),
    };
  }

  private isSameTile(
  row: number,
  col: number,
  tileType: number,
  ): boolean {
    if (
      row < 0 ||
      row >= this.mapData.length ||
      col < 0 ||
      col >= this.mapData[row].length
    ) {
      return false;
    }

    return this.mapData[row][col] === tileType;
  }

  /**
   * Render the tile map.
   */
  render(): Container {
    this.container.removeChildren();

    for (let row = 0; row < this.mapData.length; row++) {
      for (let col = 0; col < this.mapData[row].length; col++) {
        const tileType = this.mapData[row][col];

        const tile = this.renderTile(tileType, row, col);

        tile.position.set(
          col * this.tileSize,
          row * this.tileSize,
        );

        this.container.addChild(tile);
      }
    }

    return this.container;
  }

  /**
   * Render an individual tile.
   */
  private renderTile(
  tileType: number,
  row: number,
  col: number,
): Graphics {
    const tile = new Graphics();

    const connections = this.getTileConnections(
      row,
      col,
      tileType,
    );

    switch (tileType) {
      case TILE_TYPES.WOODEN_FLOOR:
        this.renderWoodenFloor(tile);
        break;

      case TILE_TYPES.CARPET:
        this.renderCarpet(tile, connections);
        break;

      case TILE_TYPES.SOFA:
        this.renderSofa(tile, connections);
        break;

      case TILE_TYPES.WALL:
        this.renderWall(tile);
        break;

      case TILE_TYPES.WINDOW:
        this.renderWindow(tile, connections);
        break;

      case TILE_TYPES.LEDGE:
        this.renderLedge(tile);
        break;

      case TILE_TYPES.TABLE:
        this.renderTable(tile, connections);
        break;

      case TILE_TYPES.TV:
        this.renderTV(tile, connections);
        break;

      default:
        const color = TILE_CONFIG[tileType]?.color ?? 0xcccccc;

        tile
          .rect(0, 0, this.tileSize, this.tileSize)
          .fill(color);
        break;
    }

    return tile;
  }

  private renderWoodenFloor(tile: Graphics): void {
    tile
      .rect(0, 0, this.tileSize, this.tileSize)
      .fill(0x9a6a42);

    // Floorboard line
    tile
      .moveTo(0, this.tileSize / 2)
      .lineTo(this.tileSize, this.tileSize / 2)
      .stroke({
        width: 1,
        color: 0x7f5434,
      });
  }

  private renderCarpet(
  tile: Graphics,
  connections: TileConnections,
  ): void {
    const left = connections.left ? 0 : 2;
    const right = connections.right ? this.tileSize : this.tileSize - 2;
    const top = connections.above ? 0 : 2;
    const bottom = connections.below ? this.tileSize : this.tileSize - 2;

    // Carpet
    tile
      .rect(
        left,
        top,
        right - left,
        bottom - top,
      )
      .fill(0x315c3a);

    // Inner carpet detail/border.
    // Only inset on sides that aren't connected.
    const detailLeft = connections.left ? left : left + 2;
    const detailRight = connections.right ? right : right - 2;
    const detailTop = connections.above ? top : top + 2;
    const detailBottom = connections.below ? bottom : bottom - 2;

    tile
      .rect(
        detailLeft,
        detailTop,
        detailRight - detailLeft,
        detailBottom - detailTop,
      )
      .stroke({
        width: 1,
        color: 0x264a2f,
      });
  }

  private renderSofa(
  tile: Graphics,
  connections: TileConnections,
  ): void {
    const size = this.tileSize;

    const baseColor = 0xd4a62a;
    const highlightColor = 0xe5bd4d;
    const shadowColor = 0xa77d1c;

    const radius = 5;

    // -------------------------------------------------------------------------
    // Main sofa body
    //
    // Fill the entire tile so adjacent sofa tiles merge seamlessly.
    // -------------------------------------------------------------------------

    tile
      .rect(0, 0, size, size)
      .fill(baseColor);

    // -------------------------------------------------------------------------
    // Top highlight
    //
    // Only draw this on the exposed top edge.
    // -------------------------------------------------------------------------

    if (!connections.above) {
      tile
        .roundRect(
          connections.left ? 0 : radius,
          0,
          size - (connections.left ? 0 : radius) -
            (connections.right ? 0 : radius),
          5,
          radius,
        )
        .fill(highlightColor);
    }

    // -------------------------------------------------------------------------
    // Left highlight
    // -------------------------------------------------------------------------

    if (!connections.left) {
      tile
        .roundRect(
          0,
          connections.above ? 0 : radius,
          5,
          size -
            (connections.above ? 0 : radius) -
            (connections.below ? 0 : radius),
          radius,
        )
        .fill(highlightColor);
    }

    // -------------------------------------------------------------------------
    // Bottom shadow
    // -------------------------------------------------------------------------

    if (!connections.below) {
      tile
        .roundRect(
          connections.left ? 0 : radius,
          size - 5,
          size -
            (connections.left ? 0 : radius) -
            (connections.right ? 0 : radius),
          5,
          radius,
        )
        .fill(shadowColor);
    }

    // -------------------------------------------------------------------------
    // Right shadow
    // -------------------------------------------------------------------------

    if (!connections.right) {
      tile
        .roundRect(
          size - 5,
          connections.above ? 0 : radius,
          5,
          size -
            (connections.above ? 0 : radius) -
            (connections.below ? 0 : radius),
          radius,
        )
        .fill(shadowColor);
    }

    // -------------------------------------------------------------------------
    // Outer corners
    //
    // These are only added when BOTH adjacent sides are exposed.
    // -------------------------------------------------------------------------

    if (!connections.left && !connections.above) {
      tile
        .circle(radius, radius, radius)
        .fill(highlightColor);
    }

    if (!connections.right && !connections.above) {
      tile
        .circle(size - radius, radius, radius)
        .fill(highlightColor);
    }

    if (!connections.left && !connections.below) {
      tile
        .circle(radius, size - radius, radius)
        .fill(shadowColor);
    }

    if (!connections.right && !connections.below) {
      tile
        .circle(size - radius, size - radius, radius)
        .fill(shadowColor);
    }
  }

  private renderWall(tile: Graphics): void {
    tile
      .rect(0, 0, this.tileSize, this.tileSize)
      .fill(0x696969);

    // Slight highlight at the top
    tile
      .rect(0, 0, this.tileSize, 4)
      .fill(0x808080);
  }

  private renderWindow(
  tile: Graphics,
  connections: TileConnections,
  ): void {
    const left = connections.left ? 0 : 2;
    const right = connections.right ? this.tileSize : this.tileSize - 2;
    const top = connections.above ? 0 : 2;
    const bottom = connections.below ? this.tileSize : this.tileSize - 2;

    // Window frame
    tile
      .rect(left, top, right - left, bottom - top)
      .fill(0x8b5a3c);

    // Glass extends into connected sides
    const glassLeft = connections.left ? left : left + 3;
    const glassRight = connections.right ? right : right - 3;
    const glassTop = connections.above ? top : top + 3;
    const glassBottom = connections.below ? bottom : bottom - 3;

    tile
      .rect(
        glassLeft,
        glassTop,
        glassRight - glassLeft,
        glassBottom - glassTop,
      )
      .fill(0x87ceeb);
  }

  private renderLedge(tile: Graphics): void {
    tile
      .rect(0, 0, this.tileSize, this.tileSize)
      .fill(0x808097);

    tile
      .rect(0, 0, this.tileSize, 5)
      .fill(0x9a9ab0);
  }

  private renderTable(
  tile: Graphics,
  connections: TileConnections,
  ): void {
    const left = connections.left ? 0 : 2;
    const right = connections.right ? this.tileSize : this.tileSize - 2;
    const top = connections.above ? 0 : 2;
    const bottom = connections.below ? this.tileSize : this.tileSize - 2;

    // Table body
    tile
      .rect(
        left,
        top,
        right - left,
        bottom - top,
      )
      .fill(0xc08a52);

    // Table top/highlight
    const detailLeft = connections.left ? left : left + 3;
    const detailRight = connections.right ? right : right - 3;
    const detailTop = connections.above ? top : top + 3;

    tile
      .rect(
        detailLeft,
        detailTop,
        detailRight - detailLeft,
        3,
      )
      .fill(0xd6a066);
  }

  private renderTV(
  tile: Graphics,
  connections: TileConnections,
  ): void {
    const left = connections.left ? 0 : 3;
    const right = connections.right ? this.tileSize : this.tileSize - 3;
    const top = connections.above ? 0 : 4;
    const bottom = connections.below
      ? this.tileSize
      : this.tileSize - 4;

    // TV body
    tile
      .rect(
        left,
        top,
        right - left,
        bottom - top,
      )
      .fill(0x222222);

    // Screen extends all the way to connected edges
    const screenLeft = connections.left ? left : left + 3;
    const screenRight = connections.right ? right : right - 3;
    const screenTop = connections.above ? top : top + 3;
    const screenBottom = connections.below ? bottom : bottom - 3;

    tile
      .rect(
        screenLeft,
        screenTop,
        screenRight - screenLeft,
        screenBottom - screenTop,
      )
      .fill(0x4f7c8a);
  }

  /**
   * Get the container holding all tile graphics.
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Check if a tile coordinate is valid and walkable.
   */
  isWalkable(tileX: number, tileY: number): boolean {
    if (
      tileX < 0 ||
      tileX >= this.mapData[0].length ||
      tileY < 0 ||
      tileY >= this.mapData.length
    ) {
      return false;
    }

    const tileType = this.mapData[tileY][tileX];
    const tileConfig = TILE_CONFIG[tileType];

    return tileConfig?.walkable ?? false;
  }

  /**
   * Check if a tile coordinate is valid and plantable.
   */
  isPlantable(tileX: number, tileY: number): boolean {
    if (
      tileX < 0 ||
      tileX >= this.mapData[0].length ||
      tileY < 0 ||
      tileY >= this.mapData.length
    ) {
      return false;
    }

    const tileType = this.mapData[tileY][tileX];
    const tileConfig = TILE_CONFIG[tileType];

    return tileConfig?.plantable ?? true;
  }
}