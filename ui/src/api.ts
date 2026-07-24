import type { Plant } from './models/Plant';
import type { PlantDetails } from './models/PlantEvent';

// Base URL of the ASP.NET Core API (see PlantOS.API/Properties/launchSettings.json).
// This is a POC, so it's just hard-coded rather than pulled from env config.
const API_BASE_URL = 'http://localhost:5199/api';

// Small helper shared by every call below: turns a non-2xx response into a
// thrown error so callers can use a simple try/catch.
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  // Some endpoints (e.g. watering) return 200/204 with no body.
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

// GET /api/plants - all plants, name + species only.
export async function fetchPlants(): Promise<Plant[]> {
  const response = await fetch(`${API_BASE_URL}/plants`);
  return handleResponse<Plant[]>(response);
}

// GET /api/plants/{id}/events - a single plant plus its full event history.
export async function fetchPlantDetails(plantId: string): Promise<PlantDetails> {
  const response = await fetch(`${API_BASE_URL}/plants/${plantId}/events`);
  return handleResponse<PlantDetails>(response);
}

// POST /api/plants - create a new plant.
// The API generates the new plant's Guid server-side. tileX/tileY default to
// 0,0 so the existing sidebar "add plant" form (which doesn't pick a
// location) keeps working unchanged; the game canvas passes real coordinates
// when a plant is added by clicking a tile.
export async function addPlant(name: string, species: string, tileX = 0, tileY = 0): Promise<Plant> {
  const response = await fetch(`${API_BASE_URL}/plants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, species, tileX, tileY }),
  });
  return handleResponse<Plant>(response);
}

// POST /api/plantevents/{plantId}/water - log a watering event "now".
export async function waterPlant(plantId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/plantevents/${plantId}/water`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  await handleResponse<void>(response);
}
