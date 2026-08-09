import { useGameWorld } from './useGameWorld';
import { PlantPlacementForm } from './PlantPlacementForm';
import { TILE_SIZE } from '../../game/mapData';
import { useEffect } from 'react';
import '../../styles/plant.css';

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
    cancelDeletion, approachingPlant, interactionMenuState,
    setInteractionMenuState } = useGameWorld();

  useEffect(() => {
    if (!approachingPlant) {
      setInteractionMenuState('closed');
    }
  }, [approachingPlant, setInteractionMenuState]);

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

      {approachingPlant && (
        <div
          className="plant-name"
          style={{
            position: 'absolute',
            left: approachingPlant.tileX * TILE_SIZE + TILE_SIZE / 2,
            top: approachingPlant.tileY * TILE_SIZE,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p>{approachingPlant.name}</p>
        </div>
      )}

      {interactionMenuState === 'open' && approachingPlant && (
        <div className="interaction-menu">
          <p>Interacting with plant: {approachingPlant?.name}</p>
          <button onClick={() => setInteractionMenuState('closed')}>Close</button>
        </div>
      )}

      {placementError && <div className="plant-placement-error">{placementError}</div>}
    </div>
  );
}
