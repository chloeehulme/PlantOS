import { useEffect, useState } from 'react';
import { useGameWorld } from './useGameWorld';
import { PlantPlacementForm } from './PlantPlacementForm';
import { PlantDetails } from '../plants/PlantDetails.tsx';
import { MAP_DATA, TILE_SIZE } from '../../game/mapData';
import '../../styles/plant.css';

export function PixiPlantCanvas() {
  const {
    hostRef,
    pendingTile,
    confirmPlacement,
    cancelPlacement,
    confirmDeletion,
    approachingPlant,
    interactionMenuState,
    setInteractionMenuState,
    waterPlant,
    viewEvents,
    plantDetails
  } = useGameWorld();

  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [addEvent, setAddEvent] = useState(false);
  const [isViewingEvents, setIsViewingEvents] = useState(false);
  
  useEffect(() => {
    if (!approachingPlant) {
      setInteractionMenuState('closed');
      setDeleteConfirmation(false);
      setIsViewingEvents(false);
    }
  }, [approachingPlant, setInteractionMenuState]);

  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });
  
  useEffect(() => {
    const host = hostRef.current;

    if (!host) return;

    const updateSize = () => {
      setCanvasSize({
        width: host.clientWidth,
        height: host.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(host);

    return () => observer.disconnect();
  }, [hostRef]);

  const mapWidth = MAP_DATA[0].length * TILE_SIZE;
  const mapHeight = MAP_DATA.length * TILE_SIZE;

  const scaleX = canvasSize.width / mapWidth;
  const scaleY = canvasSize.height / mapHeight;

  const worldScale = Math.min(scaleX, scaleY);

  const worldOffsetX =
    (canvasSize.width - mapWidth * worldScale) / 2;

  const worldOffsetY =
    (canvasSize.height - mapHeight * worldScale) / 2;

  const plantScreenY = worldOffsetY + (approachingPlant?.tileY ?? 0) * TILE_SIZE * worldScale;

  const tooltipBelow = plantScreenY < 150;

  const plantScreenX = worldOffsetX + ((approachingPlant?.tileX ?? 0) * TILE_SIZE + TILE_SIZE / 2) * worldScale;

  const sidebarSide =
    plantScreenX > canvasSize.width / 2
      ? 'left'
      : 'right';

  return (
    <div ref={hostRef} className="pixi-canvas-host">

      {pendingTile && (
        <PlantPlacementForm
          tileX={pendingTile.tileX}
          tileY={pendingTile.tileY}
          onConfirm={confirmPlacement}
          onCancel={cancelPlacement}
        />
      )}

      {approachingPlant && (
        <div
          className={`plant-tooltip ${
            interactionMenuState === 'open' ? 'plant-tooltip-expanded' : ''
          }`}
          style={{
            position: 'absolute',

            left:
              worldOffsetX +
              (approachingPlant.tileX * TILE_SIZE + TILE_SIZE / 2) *
                worldScale,

            top:
              worldOffsetY +
              (approachingPlant.tileY * TILE_SIZE +
                (tooltipBelow ? TILE_SIZE : 0)) *
                worldScale,

            transform: tooltipBelow
              ? 'translate(-50%, 0)'
              : 'translate(-50%, -100%)',
          }}
        >
        <div className="plant-tooltip-name">
          {approachingPlant.name} 
          <span className="plant-tooltip-species">
            <i>{approachingPlant.species}</i>
          </span>
        </div>

        {interactionMenuState === 'open' && !deleteConfirmation && !addEvent && (
          <div className="plant-tooltip-options">
            <button
              onClick={() => {
                setAddEvent(true);
              }}
            >
              Add event
            </button>

            <button
              onClick={() => {
                setIsViewingEvents(true);
                viewEvents(approachingPlant.id);
              }}
            >
              View events
            </button>

            <button
              onClick={() => {
                setDeleteConfirmation(true);
              }}
            >
              Delete plant
            </button>
            <button
              onClick={() => {
                setInteractionMenuState('closed');
                setIsViewingEvents(false);
              }}
            >
              Exit
            </button>
          </div>
        )}

        {interactionMenuState === 'open' && addEvent && !deleteConfirmation && (
          <div className="plant-tooltip-options">
            <button
              onClick={() => {
                waterPlant(approachingPlant.id);
                setInteractionMenuState('closed');
              }}
            >
              Water
            </button>

            <button>
              Fertilise
            </button>

            <button
              onClick={() => {
                setInteractionMenuState('closed');
                setAddEvent(false);
              }}
            >
              Exit
            </button>
          </div>
        )}

        {interactionMenuState === 'open' && deleteConfirmation && !addEvent && (
          <div className="plant-delete-confirmation">
              <p>Are you sure?</p>

              <div className="plant-delete-actions">
                <button
                  onClick={() => {
                    confirmDeletion(approachingPlant.id);
                    setDeleteConfirmation(false);
                    setInteractionMenuState('closed');
                  }}
                >
                  Yes
                </button>

                <button
                  onClick={() => {
                    setDeleteConfirmation(false);
                  }}
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isViewingEvents && plantDetails &&(
        <PlantDetails
          plant={plantDetails}
          onClose={() => {
            setIsViewingEvents(false);
          }}
          side={sidebarSide}
        />
      )}
    </div>
  );
}