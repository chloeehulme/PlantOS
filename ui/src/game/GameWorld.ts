import { Application } from 'pixi.js';
import { TileMap } from './TileMap';
import { Player, type Direction } from './Player';
import { PlantsLayer, isPlantAt } from './Plants';
import { MAP_DATA, CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from './mapData';
import { fetchPlants } from '../api';
import type { Plant } from '../models/Plant';

const MOVE_COOLDOWN_MS = 200; // milliseconds between player movements

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
}

// Owns the PixiJS Application and every game-world object (tile map, player,
// plants layer), plus the keyboard/click listeners and game loop that drive
// them. Kept as a plain class - not a React hook/component - so lifecycle is
// explicit: the caller just awaits `init()` and calls `destroy()` on
// teardown. This mirrors the TileMap/Player/PlantsLayer classes it composes.
export class GameWorld {
  private app = new Application();
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

  constructor(callbacks: GameWorldCallbacks) {
    this.callbacks = callbacks;
  }

  async init(host: HTMLElement): Promise<void> {
    // Pixi v8 uses an async init() instead of a constructor option object.
    await this.app.init({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      background: '#2d5016', // dark green background for the room
      antialias: true,
    });

    // If we were destroyed while awaiting init, destroy the (now-initialised)
    // app ourselves and bail out - whoever called destroy() couldn't do this
    // safely since init() hadn't resolved yet.
    if (this.destroyed) {
      this.app.destroy(true, { children: true });
      return;
    }

    this.ready = true;
    host.appendChild(this.app.canvas);

    // --- Initialize the tile map, plants, and player ------------------------
    this.tileMap = new TileMap(MAP_DATA);
    this.app.stage.addChild(this.tileMap.render());

    // Load plants from the API so they can be rendered on the map and block
    // player movement onto their tile. Fail soft - if the API is
    // unreachable, the game world still works, just with no plants.
    try {
      this.plants = await fetchPlants();
    } catch {
      this.plants = [];
    }

    this.plantsLayer = new PlantsLayer(this.plants);
    this.app.stage.addChild(this.plantsLayer.render());

    // Start the player near the center of the map (position 7, 6 on a 15x13 map)
    this.player = new Player(7, 6);
    this.app.stage.addChild(this.player.getContainer());

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
      }
    };

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

  // --- Click-to-place: click a tile to add a plant there --------------------
  // Deliberately simple: reuses tileMap.isWalkable and isPlantAt so a plant
  // can't be dropped on a wall/water tile or on top of another plant. The
  // actual name/species collection happens in the host UI (see
  // `GameWorldCallbacks`), not here - this class only decides whether a click
  // is a valid placement candidate.
  private attachClickListener(): void {
    this.handleCanvasClick = (event: MouseEvent) => {
      if (!this.tileMap) return;

      const rect = this.app.canvas.getBoundingClientRect();
      const tileX = Math.floor((event.clientX - rect.left) / TILE_SIZE);
      const tileY = Math.floor((event.clientY - rect.top) / TILE_SIZE);

      if (!this.tileMap.isWalkable(tileX, tileY)) {
        this.callbacks.onPlacementBlocked('Plants can only be placed on grass, path, or wood tiles.');
        return;
      }

      if (isPlantAt(this.plants, tileX, tileY)) {
        this.callbacks.onPlacementBlocked('There is already a plant on that tile.');
        return;
      }

      this.callbacks.onPlacementCandidate(tileX, tileY);
    };

    this.app.canvas.addEventListener('click', this.handleCanvasClick);
  }

  // --- Game loop: update player position each frame -------------------------
  private startGameLoop(): void {
    this.onGameTick = (ticker: { deltaMS: number }) => {
      this.lastMoveTime += ticker.deltaMS;
      if (this.lastMoveTime >= MOVE_COOLDOWN_MS && this.tileMap && this.player) {
        this.player.update(this.currentDirection, this.tileMap, this.plants);
        this.lastMoveTime = 0;
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
