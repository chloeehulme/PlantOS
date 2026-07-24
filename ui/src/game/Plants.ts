import { Container, Graphics } from 'pixi.js';
import { TILE_SIZE } from './mapData';
import type { Plant } from '../models/Plant';

// Dynamic object collision: is there a plant occupying this tile?
// Kept separate from TileMap.isWalkable (static world collision) on purpose -
// plants are placed by the player at runtime, not baked into the map layout.
export function isPlantAt(plants: Plant[], tileX: number, tileY: number): boolean {
  return plants.some((plant) => plant.tileX === tileX && plant.tileY === tileY);
}

// Renders every plant as a simple coloured square at its tile position.
// Mirrors the TileMap/Player rendering pattern - no image assets, no per-plant
// state or updates, just a static layer built once from the fetched plants.
export class PlantsLayer {
  private plants: Plant[];
  private tileSize: number;
  private container: Container;

  constructor(plants: Plant[], tileSize: number = TILE_SIZE) {
    this.plants = plants;
    this.tileSize = tileSize;
    this.container = new Container();
  }

  render(): Container {
    this.container.removeChildren();

    for (const plant of this.plants) {
      const graphic = new Graphics();
      graphic.fill(0xff4500); // orange-red, distinct from all tile/player colours
      graphic.rect(6, 6, this.tileSize - 12, this.tileSize - 12);
      graphic.fill();

      graphic.stroke({ color: 0x8b2500, width: 1 });
      graphic.rect(6, 6, this.tileSize - 12, this.tileSize - 12);
      graphic.stroke();

      const pixelX = plant.tileX * this.tileSize;
      const pixelY = plant.tileY * this.tileSize;
      graphic.position.set(pixelX, pixelY);

      this.container.addChild(graphic);
    }

    return this.container;
  }

  getContainer(): Container {
    return this.container;
  }
}
