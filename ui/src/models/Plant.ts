// A "Plant" is the simple shape returned by the API's list/get endpoints
// (matches PlantOS.Api.Responses.PlantResponse).
export interface Plant {
  id: string;
  name: string;
  species: string;
  tileX: number;
  tileY: number;
}
