import { Container, Graphics } from 'pixi.js';
import { TILE_SIZE, TILE_CONFIG } from './mapData';

export class TileMap {
  private container: Container;
  private mapData: number[][];
  private tileSize: number;

  constructor(mapData: number[][], tileSize: number = TILE_SIZE) {
    this.mapData = mapData;
    this.tileSize = tileSize;
    this.container = new Container();
  }

  /**
   * Render the tile map by creating graphics for each tile
   */
  render(): Container {
    // Clear any existing tiles
    this.container.removeChildren();

    // Iterate through map data and create tiles
    for (let row = 0; row < this.mapData.length; row++) {
      for (let col = 0; col < this.mapData[row].length; col++) {
        const tileType = this.mapData[row][col];
        const tileConfig = TILE_CONFIG[tileType];
        const tileColor = tileConfig?.color ?? 0xcccccc; // default light gray if config not found

        // Create a graphics object for this tile
        const tile = new Graphics();
        tile.fill(tileColor);
        tile.rect(0, 0, this.tileSize, this.tileSize);
        tile.fill();

        // Add a subtle border to make tiles distinct
        tile.stroke({ color: 0x000000, width: 0.5 });
        tile.rect(0, 0, this.tileSize, this.tileSize);
        tile.stroke();

        // Position the tile
        const pixelX = col * this.tileSize;
        const pixelY = row * this.tileSize;
        tile.position.set(pixelX, pixelY);

        this.container.addChild(tile);
      }
    }

    return this.container;
  }

  /**
   * Get the container holding all tile graphics
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Check if a tile coordinate is valid and walkable based on TILE_CONFIG
   */
  isWalkable(tileX: number, tileY: number): boolean {
    // Check bounds
    if (tileX < 0 || tileX >= this.mapData[0].length || tileY < 0 || tileY >= this.mapData.length) {
      return false;
    }

    // Check if tile is walkable according to its configuration
    const tileType = this.mapData[tileY][tileX];
    const tileConfig = TILE_CONFIG[tileType];
    return tileConfig?.walkable ?? false; // default to non-walkable if config not found
  }
}
