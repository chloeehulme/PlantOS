// Tile type constants
export const TILE_TYPES = {
  GRASS: 0,
  PATH: 1,
  WATER: 2,
  WALL: 3,
  WOOD: 4,
} as const;

// Tile size in pixels
export const TILE_SIZE = 32;

// Tile configuration: color and walkability for each tile type
export const TILE_CONFIG: Record<number, { color: number; walkable: boolean }> = {
  [TILE_TYPES.GRASS]: { color: 0x90ee90, walkable: true },   // light green
  [TILE_TYPES.PATH]: { color: 0xd2b48c, walkable: true },    // tan/brown
  [TILE_TYPES.WATER]: { color: 0x4a90e2, walkable: false },  // blue
  [TILE_TYPES.WALL]: { color: 0x808080, walkable: false },   // gray
  [TILE_TYPES.WOOD]: { color: 0xa0522d, walkable: true },    // sienna brown
};

// Map layout: 15 tiles wide × 13 tiles high
// Walls surround the perimeter, with grass, path, and water inside
export const MAP_DATA: number[][] = [
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [3, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3],
  [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
  [3, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
];

// Map dimensions
export const MAP_WIDTH = MAP_DATA[0].length;  // 15 tiles
export const MAP_HEIGHT = MAP_DATA.length;    // 13 tiles

// Canvas dimensions
export const CANVAS_WIDTH = MAP_WIDTH * TILE_SIZE;  // 480px
export const CANVAS_HEIGHT = MAP_HEIGHT * TILE_SIZE; // 416px
