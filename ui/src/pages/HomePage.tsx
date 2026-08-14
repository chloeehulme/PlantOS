import { useEffect, useState } from 'react';
import { fetchPlants, addPlant } from '../api';
import type { Plant } from '../models/Plant';
import { PlantList } from '../components/plants/PlantList';
import { PixiPlantCanvas } from '../components/canvas/PixiPlantCanvas';

export function HomePage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlants();
  }, []);

  async function loadPlants() {
    try {
      setError(null);
      const data = await fetchPlants();
      setPlants(data);
    } catch {
      setError('Could not reach the API.');
    }
  }

  async function handleAddPlant(name: string, species: string) {
    try {
      setError(null);
      await addPlant(name, species);
      await loadPlants();
    } catch {
      setError('Could not add plant.');
    }
  }

  return (
    <div className="home-page">
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <PlantList
        plants={plants}
        onAddPlant={handleAddPlant}
      />

      <div className="canvas-column">
        <PixiPlantCanvas />
      </div>
    </div>
  );
}