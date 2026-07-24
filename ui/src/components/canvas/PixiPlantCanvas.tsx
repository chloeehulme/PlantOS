import { useGameWorld } from './useGameWorld';
import { PlantPlacementForm } from './PlantPlacementForm';

// -----------------------------------------------------------------------------
// PixiPlantCanvas
//
// This component just renders a <div> for the PixiJS canvas to mount into,
// plus the small React-rendered chrome around it (the placement form and
// error banner). The PixiJS Application itself, the tile map/player/plants,
// keyboard input, and game loop are all owned by `GameWorld`
// (see game/GameWorld.ts), wired up here via the `useGameWorld` hook.
// -----------------------------------------------------------------------------
export function PixiPlantCanvas() {
  const { hostRef, pendingTile, placementError, confirmPlacement, cancelPlacement } = useGameWorld();

  return (
    <div className="pixi-canvas-wrapper">
      <div ref={hostRef} className="pixi-canvas-host" />

      {pendingTile && (
        <PlantPlacementForm
          tileX={pendingTile.tileX}
          tileY={pendingTile.tileY}
          onConfirm={confirmPlacement}
          onCancel={cancelPlacement}
        />
      )}

      {placementError && <div className="plant-placement-error">{placementError}</div>}
    </div>
  );
}
