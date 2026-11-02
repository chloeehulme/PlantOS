// The plant types a player can choose from. Every PNG in src/assets/plants is
// one type: "peace_lily.png" becomes "Peace Lily". A plant's `species` field
// stores that label, so adding a type is just dropping in a sprite.
const spriteFiles = import.meta.glob<string>('../assets/plants/*.png', {
  eager: true,
  import: 'default',
});

export interface PlantType {
  label: string;
  spriteUrl: string;
}

const labelFromPath = (path: string): string =>
  path
    .split('/')
    .pop()!
    .replace(/\.png$/, '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const PLANT_TYPES: PlantType[] = Object.entries(spriteFiles)
  .map(([path, spriteUrl]) => ({ label: labelFromPath(path), spriteUrl }))
  .sort((a, b) => a.label.localeCompare(b.label));

const FALLBACK_LABEL = 'Pothos';

const normalise = (text: string): string => text.toLowerCase().replace(/[^a-z]/g, '');

// Plants saved before the dropdown existed may hold free text, so match
// loosely and fall back to the pothos sprite for anything unrecognised.
export function spriteUrlFor(species: string): string {
  const wanted = normalise(species);
  const match = PLANT_TYPES.find((type) => normalise(type.label) === wanted);
  const fallback = PLANT_TYPES.find((type) => type.label === FALLBACK_LABEL) ?? PLANT_TYPES[0];
  return (match ?? fallback).spriteUrl;
}
