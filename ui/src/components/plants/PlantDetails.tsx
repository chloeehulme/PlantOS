import type { PlantDetails as PlantDetailsData } from '../../models/PlantEvent';
import { PlantEventTypeLabels } from '../../models/PlantEvent';
import '../../styles/plantDetailsSidebar.css';

interface PlantDetailsProps {
  plant: PlantDetailsData | null;
  onClose: () => void;
  side: 'left' | 'right';
}

// Right-hand panel: shows the selected plant's details and event history,
// plus a button to log a watering event via the API.
export function PlantDetails({ plant, onClose, side }: PlantDetailsProps) {
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
    <div className={`plant-events-sidebar plant-events-sidebar-${side}`}>
      <div className="plant-events-sidebar-header">
        <div>
          <h2>{plant.name}</h2>
          <p className="plant-events-sidebar-species">
            <i>{plant.species}</i>
          </p>
        </div>

        <button
          className="plant-events-sidebar-close"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <h3>Event history</h3>

      {sortedEvents.length === 0 && (
        <p className="plant-events-sidebar-empty">
          No events yet.
        </p>
      )}

      <ul className="plant-events-sidebar-history">
        {sortedEvents.map((event) => (
          <li key={event.id}>
            <strong>
              {PlantEventTypeLabels[event.eventType]}
            </strong>

            <span className="plant-events-sidebar-date">
              {new Date(event.date).toLocaleString()}
            </span>

            {event.notes && (
              <p className="plant-events-sidebar-notes">
                {event.notes}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
