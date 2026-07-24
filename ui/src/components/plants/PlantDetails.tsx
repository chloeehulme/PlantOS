import type { PlantDetails as PlantDetailsData } from '../../models/PlantEvent';
import { PlantEventTypeLabels } from '../../models/PlantEvent';

interface PlantDetailsProps {
  plant: PlantDetailsData | null;
  onWaterPlant: () => void;
  isWatering: boolean;
}

// Right-hand panel: shows the selected plant's details and event history,
// plus a button to log a watering event via the API.
export function PlantDetails({ plant, onWaterPlant, isWatering }: PlantDetailsProps) {
  if (!plant) {
    return (
      <div className="plant-details">
        <p className="placeholder">Select a plant to see its details.</p>
      </div>
    );
  }

  // Newest events first.
  const sortedEvents = [...plant.events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="plant-details">
      <h2>{plant.name}</h2>
      <p className="species">{plant.species}</p>

      <button type="button" onClick={onWaterPlant} disabled={isWatering}>
        {isWatering ? 'Watering...' : 'Water Plant'}
      </button>

      <h3>Event history</h3>
      {sortedEvents.length === 0 && <p className="placeholder">No events yet.</p>}
      <ul className="event-history">
        {sortedEvents.map((event) => (
          <li key={event.id}>
            <strong>{PlantEventTypeLabels[event.eventType]}</strong>
            <span className="event-date">{new Date(event.date).toLocaleString()}</span>
            {event.notes && <p className="event-notes">{event.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
