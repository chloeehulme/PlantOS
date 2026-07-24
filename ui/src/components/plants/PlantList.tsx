import { useState } from 'react';
import type { Plant } from '../../models/Plant';

interface PlantListProps {
  plants: Plant[];
  selectedPlantId: string | null;
  onSelectPlant: (id: string) => void;
  onAddPlant: (name: string, species: string) => void;
}

// Sidebar list of plants, plus a "+" button that reveals a tiny inline form
// for adding a new plant. Kept as one small component since the form is
// trivial - no need for a separate modal component for a POC.
export function PlantList({ plants, selectedPlantId, onSelectPlant, onAddPlant }: PlantListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !species.trim()) return;

    onAddPlant(name.trim(), species.trim());
    setName('');
    setSpecies('');
    setIsAdding(false);
  }

  return (
    <div className="plant-list">
      <div className="plant-list-header">
        <h2>Plants</h2>
        <button type="button" onClick={() => setIsAdding((prev) => !prev)} title="Add a plant">
          +
        </button>
      </div>

      {isAdding && (
        <form className="add-plant-form" onSubmit={handleSubmit}>
          <input
            placeholder="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
          <input
            placeholder="Species"
            value={species}
            onChange={(event) => setSpecies(event.target.value)}
          />
          <button type="submit">Add</button>
        </form>
      )}

      <ul>
        {plants.map((plant) => (
          <li key={plant.id}>
            <button
              type="button"
              className={plant.id === selectedPlantId ? 'selected' : ''}
              onClick={() => onSelectPlant(plant.id)}
            >
              {plant.name}
              <span className="species">{plant.species}</span>
            </button>
          </li>
        ))}
        {plants.length === 0 && <li className="empty">No plants yet - add one!</li>}
      </ul>
    </div>
  );
}
