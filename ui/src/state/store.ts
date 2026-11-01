import {
  addPlant,
  addPlantEvent,
  deletePlant,
  deletePlantEvent,
  fetchPlantDetails,
  fetchPlants,
  type AddableEventRoute,
} from '../api';
import type { Plant } from '../models/Plant';
import type { PlantDetails } from '../models/PlantEvent';

type Listener = () => void;

// Framework-free app state shared by the in-game UI panels. Panels subscribe
// and re-render on change; all API calls go through here.
export class Store {
  plants: Plant[] = [];
  details: PlantDetails | null = null;
  error: string | null = null;
  // Set when the player filled in the sidebar "add plant" form and now needs
  // to click a free tile to choose where it goes.

  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }

  setError(message: string | null): void {
    this.error = message;
    this.emit();
  }

  async loadPlants(): Promise<Plant[]> {
    try {
      this.plants = await fetchPlants();
    } catch {
      this.plants = [];
      this.error = 'Could not reach the API.';
    }
    this.emit();
    return this.plants;
  }

  async addPlant(name: string, species: string, tileX: number, tileY: number): Promise<Plant | null> {
    try {
      const plant = await addPlant(name, species, tileX, tileY);
      this.plants = [...this.plants, plant];
      this.emit();
      return plant;
    } catch {
      this.setError('Could not add plant.');
      return null;
    }
  }

  async deletePlant(plantId: string): Promise<boolean> {
    try {
      await deletePlant(plantId);
    } catch {
      this.setError('Could not delete plant.');
      return false;
    }
    this.plants = this.plants.filter((plant) => plant.id !== plantId);
    if (this.details?.id === plantId) this.details = null;
    this.emit();
    return true;
  }

  async viewDetails(plantId: string): Promise<void> {
    try {
      this.details = await fetchPlantDetails(plantId);
      this.emit();
    } catch {
      this.setError('Could not load plant events.');
    }
  }

  closeDetails(): void {
    this.details = null;
    this.emit();
  }

  async addEvent(plantId: string, route: AddableEventRoute, occurredAt?: Date): Promise<boolean> {
    try {
      await addPlantEvent(plantId, route, occurredAt);
    } catch {
      this.setError('Could not add event.');
      return false;
    }
    if (this.details?.id === plantId) await this.viewDetails(plantId);
    return true;
  }

  async deleteEvent(plantId: string, eventId: string): Promise<void> {
    try {
      await deletePlantEvent(plantId, eventId);
    } catch {
      this.setError('Could not delete event.');
      return;
    }
    await this.viewDetails(plantId);
  }
}
