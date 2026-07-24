import { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import { TileMap } from '../../game/TileMap';
import { Player, type Direction } from '../../game/Player';
import { MAP_DATA, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../game/mapData';

// -----------------------------------------------------------------------------
// PixiPlantCanvas
//
// This component owns its own PixiJS Application, completely separate from
// React's rendering. React just gives us a <div> to mount the canvas into;
// after that, Pixi's own ticker (game loop) drives everything.
//
// Now serves as the game world: tile map rendering and player movement.
// The existing plant showcase has been replaced with a tile-based map
// and a playable player character.
// -----------------------------------------------------------------------------

export function PixiPlantCanvas() {
  // Holds the <div> that the Pixi canvas gets mounted into.
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = new Application();
    // `cancelled` guards against React StrictMode's double-effect in dev (the
    // effect runs, cleans up, then runs again). `ready` tracks whether
    // app.init() actually finished - Pixi's destroy() throws if called on an
    // Application that hasn't finished initialising yet, so we must not call
    // it from the cleanup function until init() has resolved.
    let cancelled = false;
    let ready = false;
    let removeGameTicker: (() => void) | undefined;
    let currentDirection: Direction = null;
    let handleKeyDown: ((event: KeyboardEvent) => void) | undefined;
    let handleKeyUp: ((event: KeyboardEvent) => void) | undefined;
    let lastMoveTime = 0;
    const MOVE_COOLDOWN_MS = 200; // milliseconds between player movements

    async function setup() {
      // Pixi v8 uses an async init() instead of a constructor option object.
      await app.init({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        background: '#2d5016', // dark green background for the room
        antialias: true,
      });

      // If the component unmounted while we were awaiting init, destroy the
      // (now-initialised) app ourselves and bail out - the cleanup function
      // already ran and couldn't do this safely.
      if (cancelled) {
        app.destroy(true, { children: true });
        return;
      }

      ready = true;
      hostRef.current?.appendChild(app.canvas);

      // --- Initialize the tile map and player --------------------------------
      const tileMap = new TileMap(MAP_DATA);
      const tileMapContainer = tileMap.render();
      app.stage.addChild(tileMapContainer);

      // Start the player near the center of the map (position 7, 6 on a 15x13 map)
      const player = new Player(7, 6);
      const playerContainer = player.getContainer();
      app.stage.addChild(playerContainer);

      // --- Keyboard input handling -------------------------------------------
      handleKeyDown = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (key === 'arrowup' || key === 'w') {
          currentDirection = 'up';
          event.preventDefault();
        } else if (key === 'arrowdown' || key === 's') {
          currentDirection = 'down';
          event.preventDefault();
        } else if (key === 'arrowleft' || key === 'a') {
          currentDirection = 'left';
          event.preventDefault();
        } else if (key === 'arrowright' || key === 'd') {
          currentDirection = 'right';
          event.preventDefault();
        }
      };

      handleKeyUp = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (
          key === 'arrowup' ||
          key === 'arrowdown' ||
          key === 'arrowleft' ||
          key === 'arrowright' ||
          key === 'w' ||
          key === 'a' ||
          key === 's' ||
          key === 'd'
        ) {
          currentDirection = null;
          event.preventDefault();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // --- Game loop: update player position each frame ----------------------
      const onGameTick = (ticker: { deltaMS: number }) => {
        lastMoveTime += ticker.deltaMS;
        if (lastMoveTime >= MOVE_COOLDOWN_MS) {
          player.update(currentDirection, tileMap);
          lastMoveTime = 0;
        }
      };
      app.ticker.add(onGameTick);
      removeGameTicker = () => app.ticker.remove(onGameTick);
    }

    setup();

    // Cleanup runs when the component unmounts (or before the effect re-runs).
    return () => {
      cancelled = true;
      removeGameTicker?.();

      // Clean up keyboard listeners
      if (handleKeyDown) window.removeEventListener('keydown', handleKeyDown);
      if (handleKeyUp) window.removeEventListener('keyup', handleKeyUp);

      // Only safe to destroy once init() has actually finished; if not,
      // the `if (cancelled)` branch inside setup() will handle it instead.
      if (ready) {
        app.destroy(true, { children: true });
      }
    };
  }, []);

  return <div ref={hostRef} className="pixi-canvas-host" />;
}
