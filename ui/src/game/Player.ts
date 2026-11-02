import { Container, Graphics } from 'pixi.js';
import { depthOf, tileCenterToIso, viewDeltaToTile } from './iso';
import type { TileMap } from './TileMap';
import { getNearbyPlant, isPlantAt } from './Plants';
import type { Plant } from '../models/Plant';

export type Direction = 'up' | 'down' | 'left' | 'right' | null;

// Checks whether any plant lies within `radius` tiles of (tileX, tileY),
// regardless of which direction the player is facing/moving - i.e. is the
// player near a plant at all, not specifically walking towards one.
export function getApproachedPlant(plants: Plant[], tileX: number, tileY: number, radius = 2): Plant | null {
  return getNearbyPlant(plants, tileX, tileY, radius);
}

export class Player {
  private tileX: number;
  private tileY: number;
  private container: Container;

  constructor(startTileX: number, startTileY: number) {
    this.tileX = startTileX;
    this.tileY = startTileY;
    this.container = new Container();
    this.render();
    this.syncPosition();
  }

  // Placeholder character, drawn with its feet at the container origin.
  private render(): void {
    const graphic = new Graphics();
    graphic.ellipse(0, 0, 12, 6).fill({ color: 0x000000, alpha: 0.25 });
    graphic.roundRect(-8, -30, 16, 30, 4).fill(0x8b6914).stroke({ color: 0x654321, width: 1 });
    this.container.addChild(graphic);
  }

  private syncPosition(): void {
    const { x, y } = tileCenterToIso(this.tileX, this.tileY);
    this.container.position.set(x, y);
    this.container.zIndex = depthOf(this.tileX, this.tileY, 0.5);
  }

  // Keys are relative to the view: "up" heads up-right on screen, "right"
  // down-right, "down" down-left and "left" up-left, whatever the rotation.
  update(direction: Direction, tileMap: TileMap, plants: Plant[]): void {
    if (!direction) return;

    const step = {
      up: { dx: 0, dy: -1 },
      down: { dx: 0, dy: 1 },
      left: { dx: -1, dy: 0 },
      right: { dx: 1, dy: 0 },
    }[direction];
    const { dx, dy } = viewDeltaToTile(step.dx, step.dy);
    const newTileX = this.tileX + dx;
    const newTileY = this.tileY + dy;

    // Static world collision (map tiles) and dynamic object collision (plants)
    // are checked independently, then combined.
    const isWalkable = tileMap.isWalkable(newTileX, newTileY);
    const isBlockedByPlant = isPlantAt(plants, newTileX, newTileY);

    if (isWalkable && !isBlockedByPlant) {
      this.tileX = newTileX;
      this.tileY = newTileY;
      this.syncPosition();
    }
  }

  getContainer(): Container {
    return this.container;
  }

  getTilePosition(): { x: number; y: number } {
    return { x: this.tileX, y: this.tileY };
  }
}
