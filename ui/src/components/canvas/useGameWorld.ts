import { useEffect, useRef, useState } from 'react';
import { GameWorld } from '../../game/GameWorld';
import { addPlant, deletePlant, waterPlant, fetchPlantDetails } from '../../api';
import type { Plant } from '../../models/Plant';
import type { PlantDetails as PlantDetailsData } from '../../models/PlantEvent';

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
  const [approachingPlant, setApproachingPlant] = useState<Plant | null>(null);
  const [interactionMenuState, setInteractionMenuState] = useState<'open' | 'closed'>('closed');
  const [plantDetails, setPlantDetails] = useState<PlantDetailsData | null>(null);

  useEffect(() => {
    const gameWorld = new GameWorld({
      onPlacementCandidate: (tileX, tileY) => {
        setPendingTile({ tileX, tileY });
      },
      onPlacementBlocked: (reason) => {
        setPendingTile(null);
        console.error(`Placement blocked: ${reason}`);
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
      })
      .catch(() => console.error('Could not add plant.'));
  }

  function confirmDeletion(plantId: string) {
    deletePlant(plantId)
      .then(() => {
        gameWorldRef.current?.deletePlant(plantId);
      })
      .catch(() => console.error('Could not delete plant.'));
  }

  function cancelPlacement() {
    setPendingTile(null);
  }

  async function handleWaterPlant(plantId: string) {
    try {
      await waterPlant(plantId);
    } catch {
      console.error('Could not water plant.');
    }
  }

  async function handleViewEvents(plantId: string) {
    try {
      const details = await fetchPlantDetails(plantId);

      setPlantDetails(details);
    } catch {
      console.error('Could not load plant events.');
    }
  }

  return { hostRef, pendingTile, 
    confirmPlacement, confirmDeletion, cancelPlacement, 
    approachingPlant, interactionMenuState, setInteractionMenuState, 
    waterPlant: handleWaterPlant, viewEvents: handleViewEvents,
    plantDetails };
}
