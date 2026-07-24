import { Container, Graphics } from 'pixi.js';
import { TILE_SIZE } from './mapData';
import type { TileMap } from './TileMap';
import { isPlantAt } from './Plants';
import type { Plant } from '../models/Plant';

export type Direction = 'up' | 'down' | 'left' | 'right' | null;

export class Player {
  private tileX: number;
  private tileY: number;
  private tileSize: number;
  private container: Container;
  private graphic: Graphics | null = null;

  constructor(startTileX: number, startTileY: number, tileSize: number = TILE_SIZE) {
    this.tileX = startTileX;
    this.tileY = startTileY;
    this.tileSize = tileSize;
    this.container = new Container();
    this.render();
  }

  /**
   * Render the player as a brown square
   */
  private render(): void {
    // Remove old graphic if it exists
    if (this.graphic) {
      this.container.removeChild(this.graphic);
    }

    // Create new player graphic (brown square)
    this.graphic = new Graphics();
    this.graphic.fill(0x8b6914); // dark brown
    this.graphic.rect(2, 2, this.tileSize - 4, this.tileSize - 4); // slightly smaller to see it on tiles
    this.graphic.fill();

    // Add a border to make it more visible
    this.graphic.stroke({ color: 0x654321, width: 1 });
    this.graphic.rect(2, 2, this.tileSize - 4, this.tileSize - 4);
    this.graphic.stroke();

    // Position the graphic based on tile coordinates
    const pixelX = this.tileX * this.tileSize;
    const pixelY = this.tileY * this.tileSize;
    this.graphic.position.set(pixelX, pixelY);

    this.container.addChild(this.graphic);
  }

  /**
   * Update player position based on direction
   */
  update(direction: Direction, tileMap: TileMap, plants: Plant[]): void {
    if (!direction) return;

    let newTileX = this.tileX;
    let newTileY = this.tileY;

    switch (direction) {
      case 'up':
        newTileY -= 1;
        break;
      case 'down':
        newTileY += 1;
        break;
      case 'left':
        newTileX -= 1;
        break;
      case 'right':
        newTileX += 1;
        break;
    }

    // Static world collision (map tiles) and dynamic object collision (plants)
    // are checked independently, then combined.
    const isWalkable = tileMap.isWalkable(newTileX, newTileY);
    const isBlockedByPlant = isPlantAt(plants, newTileX, newTileY);

    if (isWalkable && !isBlockedByPlant) {
      this.tileX = newTileX;
      this.tileY = newTileY;

      // Update visual position
      if (this.graphic) {
        const pixelX = this.tileX * this.tileSize;
        const pixelY = this.tileY * this.tileSize;
        this.graphic.position.set(pixelX, pixelY);
      }
    }
  }

  /**
   * Get the container holding the player graphic
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Get current tile position
   */
  getTilePosition(): { x: number; y: number } {
    return { x: this.tileX, y: this.tileY };
  }

  /**
   * Get current pixel position
   */
  getPixelPosition(): { x: number; y: number } {
    return {
      x: this.tileX * this.tileSize,
      y: this.tileY * this.tileSize,
    };
  }
}
