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
  const { hostRef, pendingTile, placementError, 
    confirmPlacement, cancelPlacement, 
    pendingDeletePlant, confirmDeletion, 
    cancelDeletion } = useGameWorld();

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

      {pendingDeletePlant && (
        <div className="plant-deletion-confirmation">
          <p>Delete plant "{pendingDeletePlant.name}"?</p>
          <div className="plant-deletion-actions">
            <button onClick={() => confirmDeletion(pendingDeletePlant.id)}>Yes</button>
            <button onClick={cancelDeletion}>No</button>
          </div>
        </div>
      )}

      {placementError && <div className="plant-placement-error">{placementError}</div>}
    </div>
  );
}
