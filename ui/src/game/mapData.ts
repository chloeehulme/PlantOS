// Tile type constants
export const TILE_TYPES = {
  WOODEN_FLOOR: 0,
  CARPET: 1,
  SOFA: 2,
  WALL: 3,
  WINDOW: 4,
  LEDGE: 5,
  TABLE: 6,
  TV: 7,
} as const;

// Tile size in pixels
export const TILE_SIZE = 32;

// Tile configuration: color and walkability for each tile type
export const TILE_CONFIG: Record<number, { color: number; walkable: boolean; plantable: boolean; 
  visual: 'floor' | 'carpet' | 'sofa' | 'wall' | 'window' | 'ledge' | 'table' | 'tv'; }> = {
  [TILE_TYPES.WOODEN_FLOOR]: { color: 0x90ee90, walkable: true, plantable: true, visual: 'floor' },   // light green
  [TILE_TYPES.CARPET]: { color: 0xd2b48c, walkable: true, plantable: true, visual: 'carpet' },    // tan/brown
  [TILE_TYPES.SOFA]: { color: 0x4a90e2, walkable: false, plantable: false, visual: 'sofa' },  // blue
  [TILE_TYPES.WALL]: { color: 0x808080, walkable: false, plantable: false, visual: 'wall' },   // gray
  [TILE_TYPES.WINDOW]: { color: 0xa0522d, walkable: false, plantable: true, visual: 'window' },    // sienna brown
  [TILE_TYPES.LEDGE]: { color: 0x808097, walkable: false, plantable: true, visual: 'ledge' },
  [TILE_TYPES.TABLE]: { color: 0x8b4513, walkable: false, plantable: true, visual: 'table' },    // saddle brown
  [TILE_TYPES.TV]: { color: 0x000000, walkable: false, plantable: false, visual: 'tv' },      // black
};

// Map layout: 15 tiles wide × 13 tiles high
// Walls surround the perimeter, with grass, path, and water inside
export const MAP_DATA: number[][] = [
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [3, 0, 0, 0, 6, 7, 7, 7, 7, 7, 6, 0, 0, 0, 3],
  [3, 0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0, 3],
  [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [4, 0, 2, 2, 1, 6, 6, 6, 6, 6, 1, 1, 0, 0, 0],
  [4, 0, 0, 1, 1, 6, 6, 6, 6, 6, 1, 1, 0, 0, 0],
  [4, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 3],
  [4, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 3],
  [4, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 3],
];

// Map dimensions
export const MAP_WIDTH = MAP_DATA[0].length;  // 15 tiles
export const MAP_HEIGHT = MAP_DATA.length;    // 13 tiles
