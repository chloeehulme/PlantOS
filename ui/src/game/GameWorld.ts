import { Application, Container } from 'pixi.js';
import { TileMap } from './TileMap';
import { getApproachedPlant, Player, type Direction } from './Player';
import { PlantsLayer, isPlantAt } from './Plants';
import { MAP_DATA } from './mapData';
import { getIsoBounds, isoToTile, tileCenterToIso } from './iso';
import type { Plant } from '../models/Plant';

// Extra space above the map for the tall back walls, and plant sprite metrics
// used to anchor UI to a plant.
const WALL_HEADROOM = 64;
const PLANT_SPRITE_HEIGHT = 64;
const PLANT_BASE_OFFSET = 8;

const MOVE_COOLDOWN_MS = 100; // milliseconds between player movements

const MOVEMENT_KEYS = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd']);

// The movement keydown/keyup listeners are attached to `window`, so they must
// ignore keystrokes aimed at a text field. In-game Pixi inputs (@pixi/ui)
// are backed by a hidden native <input>, otherwise typing "w"/"a"/"s"/"d"
// would move the player and swallow the keystroke.
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

  // True when a screen-space point is over an in-game UI panel, so clicks
  // there are not treated as clicks on the map.
  isPointerBlocked(screenX: number, screenY: number): boolean;

  // Fired when the canvas is resized so the host can re-layout its UI.
  onResize(width: number, height: number): void;
}

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Owns the PixiJS Application and every game-world object (tile map, player,
// plants layer), plus the keyboard/click listeners and game loop that drive
// them. Kept as a plain class so lifecycle is explicit: the caller just
// awaits `init()` and calls `destroy()` on teardown. This mirrors the
// TileMap/Player/PlantsLayer classes it composes.
export class GameWorld {
  private app = new Application();

  private worldContainer = new Container();
  // Depth-sorted layer shared by walls/furniture, plants and the player.
  private entities = new Container();
  private worldScale = 1;
  private viewport: Viewport = { x: 0, y: 0, width: 0, height: 0 };
  private onRendererResize?: (width: number, height: number) => void;

  private tileMap: TileMap | null = null;
  private plants: Plant[] = [];
  private plantsLayer: PlantsLayer | null = null;
  private player: Player | null = null;

  private currentDirection: Direction = null;
  private lastMoveTime = 0;

  private handleKeyDown?: (event: KeyboardEvent) => void;
  private handleKeyUp?: (event: KeyboardEvent) => void;
  private handleCanvasClick?: (event: MouseEvent) => void;
  private handleCanvasPointerDown?: (event: PointerEvent) => void;
  private pressStartedOnUi = false;
  private onGameTick?: (ticker: { deltaMS: number }) => void;

  // `destroyed` guards against destroy() being called before init() resolves
  // (e.g. a dev hot reload). `ready` tracks whether app.init() actually finished -
  // Pixi's destroy() throws if called on an Application that hasn't
  // finished initialising yet, so destroy() must not call it until then.
  private destroyed = false;
  private ready = false;
  private callbacks: GameWorldCallbacks;
  isEKeyPressed: boolean = false;

  constructor(callbacks: GameWorldCallbacks) {
    this.callbacks = callbacks;
  }

  // The UI layer sits above the world; add panels here.
  readonly uiLayer = new Container();

  get stage(): Container {
    return this.app.stage;
  }

  get screenSize(): { width: number; height: number } {
    return { width: this.app.screen.width, height: this.app.screen.height };
  }

  async init(host: HTMLElement, initialPlants: Plant[]): Promise<void> {
    await this.app.init({
        resizeTo: host,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        background: '#2d5016',
        antialias: true,
    });

    if (this.destroyed) {
        this.app.destroy(true, { children: true });
        return;
    }

    this.ready = true;
    host.appendChild(this.app.canvas);

    this.viewport = { x: 0, y: 0, width: this.app.screen.width, height: this.app.screen.height };
    this.fitWorld();

    this.app.stage.addChild(this.worldContainer);

    // ---------------------------------------------------------------------
    // Tile map, plants and player (floor below, everything else depth-sorted)
    // ---------------------------------------------------------------------
    this.entities.sortableChildren = true;

    this.tileMap = new TileMap(MAP_DATA);
    await this.tileMap.load();
    this.worldContainer.addChild(this.tileMap.render());
    this.worldContainer.addChild(this.entities);
    this.entities.addChild(...this.tileMap.getBlocks());

    this.plants = [...initialPlants];
    const tileMap = this.tileMap;
    this.plantsLayer = new PlantsLayer(this.plants, this.entities, (x, y) => tileMap.getTileHeight(x, y));
    await this.plantsLayer.load();
    this.plantsLayer.render();

    this.player = new Player(7, 6);
    this.entities.addChild(this.player.getContainer());

    if (this.destroyed) {
      this.app.destroy(true, { children: true });
      return;
    }

    this.app.stage.addChild(this.uiLayer);

    this.onRendererResize = (width, height) => {
      this.callbacks.onResize(width, height);
    };
    this.app.renderer.on('resize', this.onRendererResize);

    this.attachKeyboardListeners();
    this.attachClickListener();
    this.startGameLoop();
  }

  // Scales and centres the whole map inside the free area between the
  // sidebars.
  setViewport(viewport: Viewport): void {
    this.viewport = viewport;
    this.fitWorld();
  }

  private fitWorld(): void {
    const bounds = getIsoBounds(WALL_HEADROOM);
    const { x, y, width, height } = this.viewport;

    this.worldScale = Math.max(0.01, Math.min(width / bounds.width, height / bounds.height));
    this.worldContainer.scale.set(this.worldScale);
    this.worldContainer.x = x + (width - bounds.width * this.worldScale) / 2 - bounds.minX * this.worldScale;
    this.worldContainer.y = y + (height - bounds.height * this.worldScale) / 2 - bounds.minY * this.worldScale;
  }

  // Screen-space anchor for UI attached to a plant: x is the tile centre,
  // `top` is the top of the plant sprite and `bottom` its base.
  tileToScreen(tileX: number, tileY: number): { x: number; top: number; bottom: number } {
    const centre = tileCenterToIso(tileX, tileY);
    const lift = this.tileMap?.getTileHeight(tileX, tileY) ?? 0;
    const base = centre.y + PLANT_BASE_OFFSET - lift;
    return {
      x: this.worldContainer.x + centre.x * this.worldScale,
      top: this.worldContainer.y + (base - PLANT_SPRITE_HEIGHT) * this.worldScale,
      bottom: this.worldContainer.y + base * this.worldScale,
    };
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

  private toScreenPoint(event: MouseEvent): { x: number; y: number } {
    const rect = this.app.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (this.app.screen.width / rect.width),
      y: (event.clientY - rect.top) * (this.app.screen.height / rect.height),
    };
  }

  private attachClickListener(): void {
    // A panel button may hide its panel on pointerup, before the canvas 'click'
    // fires; remembering where the press started stops it hitting the map.
    this.handleCanvasPointerDown = (event: PointerEvent) => {
      const { x, y } = this.toScreenPoint(event);
      this.pressStartedOnUi = this.callbacks.isPointerBlocked(x, y);
    };
    this.app.canvas.addEventListener('pointerdown', this.handleCanvasPointerDown);

    this.handleCanvasClick = (event: MouseEvent) => {
      if (!this.tileMap) return;
      if (this.pressStartedOnUi) {
        this.pressStartedOnUi = false;
        return;
      }

      const rect = this.app.canvas.getBoundingClientRect();

      // Convert browser coordinates to Pixi's logical screen coordinates.
      const scaleX = this.app.screen.width / rect.width;
      const scaleY = this.app.screen.height / rect.height;

      const screenX =
        (event.clientX - rect.left) * scaleX;

      const screenY =
        (event.clientY - rect.top) * scaleY;

      if (this.callbacks.isPointerBlocked(screenX, screenY)) return;

      // Convert screen coordinates back into world coordinates.
      const worldX =
        (screenX - this.worldContainer.x) /
        this.worldContainer.scale.x;

      const worldY =
        (screenY - this.worldContainer.y) /
        this.worldContainer.scale.y;

      // Convert world coordinates into tile coordinates.
      const { tileX, tileY } = isoToTile(worldX, worldY);

      if (!this.tileMap.isPlantable(tileX, tileY)) {
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
    this.plantsLayer?.addPlant(plant);
  }

  deletePlant(plantId: string): void {
    this.plants = this.plants.filter(plant => plant.id !== plantId);
    this.plantsLayer?.removePlant(plantId);
  }

  destroy(): void {
    this.destroyed = true;

    if (this.onRendererResize) this.app.renderer.off('resize', this.onRendererResize);
    if (this.onGameTick) this.app.ticker.remove(this.onGameTick);
    if (this.handleKeyDown) window.removeEventListener('keydown', this.handleKeyDown);
    if (this.handleKeyUp) window.removeEventListener('keyup', this.handleKeyUp);
    if (this.handleCanvasClick) this.app.canvas.removeEventListener('click', this.handleCanvasClick);
    if (this.handleCanvasPointerDown) this.app.canvas.removeEventListener('pointerdown', this.handleCanvasPointerDown);

    // Only safe to destroy once init() has actually finished; if not, the
    // `if (this.destroyed)` branch inside init() will handle it instead.
    if (this.ready) {
      this.app.destroy(true, { children: true });
    }
  }
}
