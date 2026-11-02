import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { depthOf, tileCenterToIso } from './iso';
import type { Plant } from '../models/Plant';
import { PLANT_TYPES, spriteUrlFor } from './plantTypes';

// Where a plant's pot base sits relative to the tile centre.
const PLANT_FOOT_OFFSET_Y = 8;

// Dynamic object collision: is there a plant occupying this tile?
// Kept separate from TileMap.isWalkable (static world collision) on purpose -
// plants are placed by the player at runtime, not baked into the map layout.
export function isPlantAt(plants: Plant[], tileX: number, tileY: number): boolean {
  return plants.some((plant) => plant.tileX === tileX && plant.tileY === tileY);
}

export function getNearbyPlant(plants: Plant[], tileX: number, tileY: number, radius: number): Plant | null {
  return plants.find((plant) => {
    const dx = plant.tileX - tileX;
    const dy = plant.tileY - tileY;
    return dx * dx + dy * dy <= radius * radius;
  }) ?? null;
}

// Draws each plant as a sprite standing on its tile. Sprites are added to the
// shared `parent` (the depth-sorted entities container) so they sort correctly
// against walls, furniture and the player.
export class PlantsLayer {
  private plants: Plant[];
  private parent: Container;
  private getTileHeight: (tileX: number, tileY: number) => number;
  private sprites = new Map<string, Sprite>();

  constructor(
    plants: Plant[],
    parent: Container,
    getTileHeight: (tileX: number, tileY: number) => number,
  ) {
    this.plants = plants;
    this.parent = parent;
    this.getTileHeight = getTileHeight;
  }

  async load(): Promise<void> {
    const urls = PLANT_TYPES.map((type) => type.spriteUrl);
    const textures = await Assets.load<Texture>(urls);
    for (const url of urls) textures[url].source.scaleMode = 'nearest';
  }

  render(): void {
    for (const sprite of this.sprites.values()) sprite.destroy();
    this.sprites.clear();
    for (const plant of this.plants) this.addSprite(plant);
  }

  addPlant(plant: Plant): void {
    if (!this.plants.includes(plant)) this.plants.push(plant);
    if (!this.sprites.has(plant.id)) this.addSprite(plant);
  }

  removePlant(plantId: string): void {
    this.plants = this.plants.filter((p) => p.id !== plantId);
    this.sprites.get(plantId)?.destroy();
    this.sprites.delete(plantId);
  }

  private addSprite(plant: Plant): void {
    const url = spriteUrlFor(plant.species);
    const sprite = new Sprite(Assets.get<Texture>(url));
    sprite.anchor.set(0.5, 1);
    const { x, y } = tileCenterToIso(plant.tileX, plant.tileY);
    sprite.position.set(x, y + PLANT_FOOT_OFFSET_Y - this.getTileHeight(plant.tileX, plant.tileY));
    sprite.zIndex = depthOf(plant.tileX, plant.tileY, 0.25);
    this.parent.addChild(sprite);
    this.sprites.set(plant.id, sprite);
  }
}
