import { useEffect, useState } from 'react';
import { fetchPlants, fetchPlantDetails, addPlant, waterPlant } from '../api';
import type { Plant } from '../models/Plant';
import type { PlantDetails as PlantDetailsData } from '../models/PlantEvent';
import { PlantList } from '../components/plants/PlantList';
import { PlantDetails } from '../components/plants/PlantDetails';
import { PixiPlantCanvas } from '../components/canvas/PixiPlantCanvas';

// HomePage wires together the three main pieces of the POC:
//  - PlantList (left): pick/add a plant
//  - PixiPlantCanvas (centre): the PixiJS scene
//  - PlantDetails (right): selected plant's info + "Water Plant" action
//
// All state lives here in plain useState - no Redux/Context needed for a
// POC this small.
export function HomePage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<PlantDetailsData | null>(null);
  const [isWatering, setIsWatering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the plant list once on mount.
  useEffect(() => {
    loadPlants();
  }, []);

  async function loadPlants() {
    try {
      setError(null);
      const data = await fetchPlants();
      setPlants(data);
    } catch {
      setError('Could not reach the API. Is it running on http://localhost:5199?');
    }
  }

  async function handleSelectPlant(id: string) {
    setSelectedPlantId(id);
    try {
      setError(null);
      const details = await fetchPlantDetails(id);
      setSelectedPlant(details);
    } catch {
      setError('Could not load plant details.');
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

  async function handleWaterPlant() {
    if (!selectedPlantId) return;

    try {
      setError(null);
      setIsWatering(true);
      await waterPlant(selectedPlantId);
      // Refresh details so the new watering event shows up in the history.
      const details = await fetchPlantDetails(selectedPlantId);
      setSelectedPlant(details);
    } catch {
      setError('Could not water plant.');
    } finally {
      setIsWatering(false);
    }
  }

  return (
    <div className="home-page">
      {error && <div className="error-banner">{error}</div>}

      <PlantList
        plants={plants}
        selectedPlantId={selectedPlantId}
        onSelectPlant={handleSelectPlant}
        onAddPlant={handleAddPlant}
      />

      <div className="canvas-column">
        <PixiPlantCanvas />
      </div>

      <PlantDetails plant={selectedPlant} onWaterPlant={handleWaterPlant} isWatering={isWatering} />
    </div>
  );
}
