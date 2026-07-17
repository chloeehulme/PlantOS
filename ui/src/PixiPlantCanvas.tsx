import { useEffect, useRef } from 'react';
import { Application, Container, Graphics } from 'pixi.js';

// -----------------------------------------------------------------------------
// PixiPlantCanvas
//
// This component owns its own PixiJS Application, completely separate from
// React's rendering. React just gives us a <div> to mount the canvas into;
// after that, Pixi's own ticker (game loop) drives everything.
//
// This is intentionally simple - just enough to prove Pixi works inside a
// React + Vite app. Later this can grow to load real sprites, handle a full
// scene graph (room background, multiple plants, weather, etc.) without
// touching the rest of the app.
// -----------------------------------------------------------------------------

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 420;

// A tiny sparkle particle: just a Graphics dot that drifts up and fades out.
interface Sparkle {
  graphics: Graphics;
  age: number; // seconds since spawned
  lifetime: number; // seconds until it disappears
}

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
    let removeTicker: (() => void) | undefined;
    let sparkleTimer: ReturnType<typeof setInterval> | undefined;

    async function setup() {
      // Pixi v8 uses an async init() instead of a constructor option object.
      await app.init({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        background: '#cfeadd', // simple flat "room" colour placeholder
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

      // --- Build a placeholder potted plant out of basic shapes -------------
      // Swap this out later for a real sprite via Assets.load('plant.png').
      const plant = new Container();
      plant.x = CANVAS_WIDTH / 2;
      plant.y = CANVAS_HEIGHT / 2 + 60;
      app.stage.addChild(plant);

      const pot = new Graphics()
        .moveTo(-40, 0)
        .lineTo(40, 0)
        .lineTo(30, 70)
        .lineTo(-30, 70)
        .closePath()
        .fill(0xb5651d); // terracotta brown
      plant.addChild(pot);

      const leaves = new Graphics()
        .ellipse(0, -60, 26, 45)
        .fill(0x3f8f4f)
        .ellipse(-35, -30, 20, 34)
        .fill(0x4caf60)
        .ellipse(35, -30, 20, 34)
        .fill(0x4caf60);
      plant.addChild(leaves);

      // Sway the whole plant gently around the base of the pot, like it's
      // idling in a breeze. Pivoting at the bottom of the pot (y = 70) keeps
      // its "feet" planted while the top sways side to side.
      plant.pivot.set(0, 70);
      plant.y += 70;

      let elapsedSeconds = 0;
      const onTick = (ticker: { deltaMS: number }) => {
        elapsedSeconds += ticker.deltaMS / 1000;
        plant.rotation = Math.sin(elapsedSeconds * 1.2) * 0.04;
      };
      app.ticker.add(onTick);
      removeTicker = () => app.ticker.remove(onTick);

      // --- Sparkle particles -------------------------------------------------
      // Every few seconds, spawn a handful of little sparkles near the leaves
      // that drift upward and fade out. Purely decorative, proves particle
      // -style effects work.
      const sparkles: Sparkle[] = [];

      function spawnSparkleBurst() {
        for (let i = 0; i < 4; i++) {
          const sparkleGfx = new Graphics()
            .star(0, 0, 4, 5, 2)
            .fill(0xfff6b7);

          sparkleGfx.x = plant.x + (Math.random() - 0.5) * 100;
          sparkleGfx.y = plant.y - 90 + (Math.random() - 0.5) * 60;
          sparkleGfx.alpha = 0;
          app.stage.addChild(sparkleGfx);

          sparkles.push({ graphics: sparkleGfx, age: 0, lifetime: 1.5 + Math.random() });
        }
      }

      sparkleTimer = setInterval(spawnSparkleBurst, 3000);
      spawnSparkleBurst(); // show one immediately so the effect is visible right away

      const onSparkleTick = (ticker: { deltaMS: number }) => {
        const dt = ticker.deltaMS / 1000;

        for (let i = sparkles.length - 1; i >= 0; i--) {
          const sparkle = sparkles[i];
          sparkle.age += dt;

          const progress = sparkle.age / sparkle.lifetime;
          sparkle.graphics.y -= 12 * dt; // drift upward
          sparkle.graphics.rotation += dt; // gentle spin
          // Fade in quickly, then fade out - keeps it "subtle" rather than a hard blink.
          sparkle.graphics.alpha = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;

          if (progress >= 1) {
            app.stage.removeChild(sparkle.graphics);
            sparkle.graphics.destroy();
            sparkles.splice(i, 1);
          }
        }
      };
      app.ticker.add(onSparkleTick);
      const removeSparkleTicker = () => app.ticker.remove(onSparkleTick);
      const previousRemoveTicker = removeTicker;
      removeTicker = () => {
        previousRemoveTicker?.();
        removeSparkleTicker();
        sparkles.forEach((s) => s.graphics.destroy());
      };
    }

    setup();

    // Cleanup runs when the component unmounts (or before the effect re-runs).
    return () => {
      cancelled = true;
      removeTicker?.();
      if (sparkleTimer) clearInterval(sparkleTimer);

      // Only safe to destroy once init() has actually finished; if not,
      // the `if (cancelled)` branch inside setup() will handle it instead.
      if (ready) {
        app.destroy(true, { children: true });
      }
    };
  }, []);

  return <div ref={hostRef} className="pixi-canvas-host" />;
}
