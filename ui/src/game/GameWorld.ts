import { Application, Container } from 'pixi.js';
import { TileMap } from './TileMap';
import { getApproachedPlant, Player, type Direction } from './Player';
import { PlantsLayer, isPlantAt } from './Plants';
import { MAP_DATA, TILE_SIZE } from './mapData';
import { fetchPlants } from '../api';
import type { Plant } from '../models/Plant';

const MOVE_COOLDOWN_MS = 100; // milliseconds between player movements

const MOVEMENT_KEYS = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd']);

// The movement keydown/keyup listeners are attached to `window` so they work
// no matter where focus is on the page. That means they need to explicitly
// ignore keystrokes aimed at a text field (e.g. the sidebar Add Plant form),
// otherwise typing "w"/"a"/"s"/"d" there would move the player and swallow
// the keystroke instead of entering it into the input.
function isTypingIntoTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

export interface GameWorldCallbacks {
  // Fired when a click lands on a free, walkable tile - the host UI should
  // ask the player for a name/species and then call `addPlant`.
  onPlacementCandidate(tileX: number, tileY: number): void;

  // Fired when a click can't place a plant (wall/water tile, or one already
  // occupied) so the host UI can show why.
  onPlacementBlocked(reason: string): void;

  onApproachingPlant(plant: Plant | null): void;

  onInteractionWithPlant(): void;
}

// Owns the PixiJS Application and every game-world object (tile map, player,
// plants layer), plus the keyboard/click listeners and game loop that drive
// them. Kept as a plain class - not a React hook/component - so lifecycle is
// explicit: the caller just awaits `init()` and calls `destroy()` on
// teardown. This mirrors the TileMap/Player/PlantsLayer classes it composes.
export class GameWorld {
  private app = new Application();

  private worldContainer = new Container();
  private worldScale = 1;

  private tileMap: TileMap | null = null;
  private plants: Plant[] = [];
  private plantsLayer: PlantsLayer | null = null;
  private player: Player | null = null;

  private currentDirection: Direction = null;
  private lastMoveTime = 0;

  private handleKeyDown?: (event: KeyboardEvent) => void;
  private handleKeyUp?: (event: KeyboardEvent) => void;
  private handleCanvasClick?: (event: MouseEvent) => void;
  private onGameTick?: (ticker: { deltaMS: number }) => void;

  // `destroyed` guards against React StrictMode's double-effect in dev
  // (init() starts, destroy() is called before it resolves, init() then
  // resolves late). `ready` tracks whether app.init() actually finished -
  // Pixi's destroy() throws if called on an Application that hasn't
  // finished initialising yet, so destroy() must not call it until then.
  private destroyed = false;
  private ready = false;
  private callbacks: GameWorldCallbacks;
  isEKeyPressed: boolean = false;

  constructor(callbacks: GameWorldCallbacks) {
    this.callbacks = callbacks;
  }

  async init(host: HTMLElement): Promise<void> {
    await this.app.init({
        resizeTo: host,
        background: '#2d5016',
        antialias: true,
    });

    if (this.destroyed) {
        this.app.destroy(true, { children: true });
        return;
    }

    this.ready = true;
    host.appendChild(this.app.canvas);

    // ---------------------------------------------------------------------
    // Calculate the actual map size in game pixels
    // ---------------------------------------------------------------------
    const mapWidth = MAP_DATA[0].length * TILE_SIZE;
    const mapHeight = MAP_DATA.length * TILE_SIZE;

    // ---------------------------------------------------------------------
    // Scale the whole world so the entire map fits the canvas
    // ---------------------------------------------------------------------
    const scaleX = this.app.screen.width / mapWidth;
    const scaleY = this.app.screen.height / mapHeight;

    this.worldScale = Math.min(scaleX, scaleY);

    this.worldContainer.scale.set(this.worldScale);

    // Centre the map in the canvas
    this.worldContainer.x =
        (this.app.screen.width - mapWidth * this.worldScale) / 2;

    this.worldContainer.y =
        (this.app.screen.height - mapHeight * this.worldScale) / 2;

    this.app.stage.addChild(this.worldContainer);

    // ---------------------------------------------------------------------
    // Tile map
    // ---------------------------------------------------------------------
    this.tileMap = new TileMap(MAP_DATA);
    this.worldContainer.addChild(this.tileMap.render());

    // ---------------------------------------------------------------------
    // Plants
    // ---------------------------------------------------------------------
    try {
        this.plants = await fetchPlants();
    } catch {
        this.plants = [];
    }

    this.plantsLayer = new PlantsLayer(this.plants);
    this.worldContainer.addChild(this.plantsLayer.render());

    // ---------------------------------------------------------------------
    // Player
    // ---------------------------------------------------------------------
    this.player = new Player(7, 6);
    this.worldContainer.addChild(this.player.getContainer());

    this.attachKeyboardListeners();
    this.attachClickListener();
    this.startGameLoop();
  }

  // --- Keyboard input handling ---------------------------------------------
  private attachKeyboardListeners(): void {
    this.handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingIntoTextField(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') {
        this.currentDirection = 'up';
        event.preventDefault();
      } else if (key === 'arrowdown' || key === 's') {
        this.currentDirection = 'down';
        event.preventDefault();
      } else if (key === 'arrowleft' || key === 'a') {
        this.currentDirection = 'left';
        event.preventDefault();
      } else if (key === 'arrowright' || key === 'd') {
        this.currentDirection = 'right';
        event.preventDefault();
      } else if (key === 'e') {
        this.isEKeyPressed = true;
        event.preventDefault();
      }
    };

    // Reset the current direction when the key is released so the player stops
    this.handleKeyUp = (event: KeyboardEvent) => {
      if (isTypingIntoTextField(event.target)) return;

      const key = event.key.toLowerCase();
      if (MOVEMENT_KEYS.has(key)) {
        this.currentDirection = null;
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private attachClickListener(): void {
    this.handleCanvasClick = (event: MouseEvent) => {
      if (!this.tileMap) return;

      const rect = this.app.canvas.getBoundingClientRect();

      // Convert browser coordinates to Pixi's logical screen coordinates.
      const scaleX = this.app.screen.width / rect.width;
      const scaleY = this.app.screen.height / rect.height;

      const screenX =
        (event.clientX - rect.left) * scaleX;

      const screenY =
        (event.clientY - rect.top) * scaleY;

      // Convert screen coordinates back into world coordinates.
      const worldX =
        (screenX - this.worldContainer.x) /
        this.worldContainer.scale.x;

      const worldY =
        (screenY - this.worldContainer.y) /
        this.worldContainer.scale.y;

      // Convert world coordinates into tile coordinates.
      const tileX = Math.floor(worldX / TILE_SIZE);
      const tileY = Math.floor(worldY / TILE_SIZE);

      if (!this.tileMap.isWalkable(tileX, tileY)) {
        this.callbacks.onPlacementBlocked(
          'Plants can only be placed on grass, path, or wood tiles.'
        );
        return;
      }

      if (isPlantAt(this.plants, tileX, tileY)) {
        this.plants.find(plant => plant.tileX === tileX && plant.tileY === tileY);
        return;
      }

      this.callbacks.onPlacementCandidate(tileX, tileY);
    };

    this.app.canvas.addEventListener(
      'click',
      this.handleCanvasClick
    );
  }

  // --- Game loop: update player position each frame -------------------------
  private startGameLoop(): void {
    this.onGameTick = (ticker: { deltaMS: number }) => {
      this.lastMoveTime += ticker.deltaMS;
      if (this.lastMoveTime >= MOVE_COOLDOWN_MS && this.tileMap && this.player) {
        this.player.update(this.currentDirection, this.tileMap, this.plants);
        this.lastMoveTime = 0;

        const { x, y } = this.player.getTilePosition();
        const approachedPlant = getApproachedPlant(this.plants, x, y);
        this.callbacks.onApproachingPlant(approachedPlant);
        // if player clicks letter 'E' key while approaching plant, log the plant's name to the console
        if (this.isEKeyPressed && approachedPlant) {
          this.callbacks.onInteractionWithPlant();
        }
      }
    };
    this.app.ticker.add(this.onGameTick);
  }

  // Adds a plant that was just created via the API so it appears on the map
  // immediately, without re-fetching the whole plant list.
  addPlant(plant: Plant): void {
    this.plants.push(plant);
    this.plantsLayer?.render();
  }

  deletePlant(plantId: string): void {
    this.plants = this.plants.filter(plant => plant.id !== plantId);
    this.plantsLayer?.removePlant(plantId);
  }

  destroy(): void {
    this.destroyed = true;

    if (this.onGameTick) this.app.ticker.remove(this.onGameTick);
    if (this.handleKeyDown) window.removeEventListener('keydown', this.handleKeyDown);
    if (this.handleKeyUp) window.removeEventListener('keyup', this.handleKeyUp);
    if (this.handleCanvasClick) this.app.canvas.removeEventListener('click', this.handleCanvasClick);

    // Only safe to destroy once init() has actually finished; if not, the
    // `if (this.destroyed)` branch inside init() will handle it instead.
    if (this.ready) {
      this.app.destroy(true, { children: true });
    }
  }
}
