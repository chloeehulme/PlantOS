import { useEffect, useRef, useState } from 'react';
import { GameWorld } from '../../game/GameWorld';
import { addPlant } from '../../api';

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
  const [placementError, setPlacementError] = useState<string | null>(null);

  useEffect(() => {
    const gameWorld = new GameWorld({
      onPlacementCandidate: (tileX, tileY) => {
        setPlacementError(null);
        setPendingTile({ tileX, tileY });
      },
      onPlacementBlocked: (reason) => {
        setPlacementError(reason);
        setPendingTile(null);
      },
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

  function cancelPlacement() {
    setPendingTile(null);
  }

  return { hostRef, pendingTile, placementError, confirmPlacement, cancelPlacement };
}
