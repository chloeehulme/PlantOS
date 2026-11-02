import { MAP_HEIGHT, MAP_WIDTH } from './mapData';

// 2:1 isometric projection. The logical grid (MAP_DATA, plant tileX/tileY,
// walkability) stays in plain tile coordinates; only rendering and input go
// through these helpers.

export const ISO_TILE_W = 64;
export const ISO_TILE_H = 40;

// Which map corner sits at the top of the screen, in 90-degree clockwise
// steps: 0, 1, 2 or 3.
export type ViewRotation = 0 | 1 | 2 | 3;
export const VIEW_ROTATION = 3 as ViewRotation;

const HALF_W = ISO_TILE_W / 2;
const HALF_H = ISO_TILE_H / 2;

// Map size as seen after rotation (width and height swap on odd rotations).
export const VIEW_WIDTH = VIEW_ROTATION % 2 ? MAP_HEIGHT : MAP_WIDTH;
export const VIEW_HEIGHT = VIEW_ROTATION % 2 ? MAP_WIDTH : MAP_HEIGHT;

// Logical tile -> tile in the rotated view grid.
export function rotateTile(tileX: number, tileY: number): { x: number; y: number } {
  switch (VIEW_ROTATION) {
    case 1: return { x: MAP_HEIGHT - 1 - tileY, y: tileX };
    case 2: return { x: MAP_WIDTH - 1 - tileX, y: MAP_HEIGHT - 1 - tileY };
    case 3: return { x: tileY, y: MAP_WIDTH - 1 - tileX };
    default: return { x: tileX, y: tileY };
  }
}

// Inverse of rotateTile.
export function unrotateTile(viewX: number, viewY: number): { tileX: number; tileY: number } {
  switch (VIEW_ROTATION) {
    case 1: return { tileX: viewY, tileY: MAP_HEIGHT - 1 - viewX };
    case 2: return { tileX: MAP_WIDTH - 1 - viewX, tileY: MAP_HEIGHT - 1 - viewY };
    case 3: return { tileX: MAP_WIDTH - 1 - viewY, tileY: viewX };
    default: return { tileX: viewX, tileY: viewY };
  }
}

// Converts a movement step in view space (up = towards the top corner's
// side) into the logical tile step, so keys stay screen-relative.
export function viewDeltaToTile(dx: number, dy: number): { dx: number; dy: number } {
  switch (VIEW_ROTATION) {
    case 1: return { dx: dy, dy: -dx };
    case 2: return { dx: -dx, dy: -dy };
    case 3: return { dx: -dy, dy: dx };
    default: return { dx, dy };
  }
}

// World-space position of a tile's top vertex (the diamond's top corner).
export function tileToIso(tileX: number, tileY: number): { x: number; y: number } {
  const v = rotateTile(tileX, tileY);
  return {
    x: (v.x - v.y) * HALF_W,
    y: (v.x + v.y) * HALF_H,
  };
}

// World-space position of the diamond's centre - where things "stand".
export function tileCenterToIso(tileX: number, tileY: number): { x: number; y: number } {
  const { x, y } = tileToIso(tileX, tileY);
  return { x, y: y + HALF_H };
}

// Inverse of tileToIso, floored to the tile containing the world point.
export function isoToTile(worldX: number, worldY: number): { tileX: number; tileY: number } {
  const a = worldX / HALF_W;
  const b = worldY / HALF_H;
  return unrotateTile(Math.floor((a + b) / 2), Math.floor((b - a) / 2));
}

// Depth value: anything further down-screen draws on top. `bias` lets
// entities standing on a tile sort above blocks on the same tile.
export function depthOf(tileX: number, tileY: number, bias = 0): number {
  const v = rotateTile(tileX, tileY);
  return v.x + v.y + bias;
}

// Bounding box of the whole map diamond in world space, with extra headroom
// for tall objects (walls) that rise above the back corner.
export function getIsoBounds(headroom: number): { minX: number; minY: number; width: number; height: number } {
  const minX = -VIEW_HEIGHT * HALF_W;
  const maxX = VIEW_WIDTH * HALF_W;
  const minY = -headroom;
  const maxY = (VIEW_WIDTH + VIEW_HEIGHT) * HALF_H;
  return { minX, minY, width: maxX - minX, height: maxY - minY };
}
