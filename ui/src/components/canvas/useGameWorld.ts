import { useEffect, useRef, useState } from 'react';
import { GameWorld } from '../../game/GameWorld';
import { addPlant, deletePlant } from '../../api';
import type { Plant } from '../../models/Plant';

interface PendingTile {
  tileX: number;
  tileY: number;
}

// React glue around `GameWorld`: creates one instance per mount, wires its
// callbacks up to a bit of React state for the placement form/error banner,
// and tears it down on unmount. All the PixiJS/game-loop logic itself lives
// in GameWorld - this hook just bridges it to React.
export function useGameWorld() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameWorldRef = useRef<GameWorld | null>(null);
  const [pendingTile, setPendingTile] = useState<PendingTile | null>(null);
  const [pendingDeletePlant, setPendingDeletePlant] = useState<Plant | null>(null);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [approachingPlant, setApproachingPlant] = useState<Plant | null>(null);
  const [interactionMenuState, setInteractionMenuState] = useState<'open' | 'closed'>('closed');

  useEffect(() => {
    const gameWorld = new GameWorld({
      onPlacementCandidate: (tileX, tileY) => {
        setPlacementError(null);
        setPendingTile({ tileX, tileY });
      },
      onDeleteCandidate: (plantId, plantName) => {
        setPlacementError(null);
        setPendingDeletePlant({ id: plantId, name: plantName } as Plant);
      },
      onPlacementBlocked: (reason) => {
        setPlacementError(reason);
        setPendingTile(null);
      },
      onApproachingPlant: (plant) => {
        setApproachingPlant(plant); 
      },
      onInteractionWithPlant: () => {
        setInteractionMenuState('open');
        gameWorldRef.current!.isEKeyPressed = false; // Reset the flag after handling the interaction
        console.log('Interaction menu opened');
      }
    });
    gameWorldRef.current = gameWorld;

    if (hostRef.current) {
      gameWorld.init(hostRef.current);
    }

    return () => {
      gameWorld.destroy();
    };
  }, []);

  function confirmPlacement(name: string, species: string) {
    if (!pendingTile) return;

    addPlant(name, species, pendingTile.tileX, pendingTile.tileY)
      .then((newPlant) => {
        gameWorldRef.current?.addPlant(newPlant);
        setPendingTile(null);
        setPlacementError(null);
      })
      .catch(() => setPlacementError('Could not add plant.'));
  }

  function confirmDeletion(plantId: string) {
    if (!pendingDeletePlant) return;

    deletePlant(plantId)
      .then(() => {
        gameWorldRef.current?.deletePlant(plantId);
        setPendingDeletePlant(null);
        setPlacementError(null);
      })
      .catch(() => setPlacementError('Could not delete plant.'));
  }

  function cancelPlacement() {
    setPendingTile(null);
  }

  function cancelDeletion() {
    setPendingDeletePlant(null);
  }

  return { hostRef, pendingTile, pendingDeletePlant, placementError, 
    confirmPlacement, confirmDeletion, cancelPlacement, 
    cancelDeletion, approachingPlant, interactionMenuState, setInteractionMenuState };
}
