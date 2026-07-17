import type { Plant } from './Plant';

// Mirrors the PlantEventType enum in PlantOS.Core.Entities.
// The API serialises enums as numbers by default, so the numeric
// values here must line up exactly with the C# enum order.
// (Written as a const object + union type rather than a TS `enum` - this
// project's tsconfig has `erasableSyntaxOnly` enabled, which disallows
// real TS enums since they compile to extra runtime code.)
export const PlantEventType = {
  Water: 0,
  Fertilise: 1,
  Repot: 2,
  Prune: 3,
  Bloom: 4,
  NewLeaf: 5,
  PestDetection: 6,
} as const;

export type PlantEventType = (typeof PlantEventType)[keyof typeof PlantEventType];

// Friendly labels for display purposes, keyed by the enum value above.
export const PlantEventTypeLabels: Record<PlantEventType, string> = {
  [PlantEventType.Water]: 'Watered',
  [PlantEventType.Fertilise]: 'Fertilised',
  [PlantEventType.Repot]: 'Repotted',
  [PlantEventType.Prune]: 'Pruned',
  [PlantEventType.Bloom]: 'Bloomed',
  [PlantEventType.NewLeaf]: 'New leaf',
  [PlantEventType.PestDetection]: 'Pest detected',
};

// A single logged event for a plant (matches PlantEventResponse).
export interface PlantEvent {
  id: string;
  eventType: PlantEventType;
  date: string; // ISO 8601 string, e.g. "2026-07-17T10:00:00Z"
  notes?: string;
}

// A plant plus its full event history (matches PlantDetailedResponse).
export interface PlantDetails extends Plant {
  events: PlantEvent[];
}
