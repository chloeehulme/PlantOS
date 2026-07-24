interface PlantPlacementFormProps {
  tileX: number;
  tileY: number;
  onConfirm: (name: string, species: string) => void;
  onCancel: () => void;
}

// Small form shown after clicking a valid tile on the game canvas. A plain
// React form rather than window.prompt()/alert(), since those aren't
// supported in every host (e.g. VS Code's Simple Browser).
export function PlantPlacementForm({ tileX, tileY, onConfirm, onCancel }: PlantPlacementFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = (formData.get('name') as string)?.trim();
    const species = (formData.get('species') as string)?.trim();
    if (!name || !species) return;

    onConfirm(name, species);
  }

  return (
    <form className="plant-placement-form" onSubmit={handleSubmit}>
      <p>
        New plant at ({tileX}, {tileY})
      </p>
      <input name="name" placeholder="Name" autoFocus />
      <input name="species" placeholder="Species" />
      <div className="plant-placement-form-actions">
        <button type="submit">Add</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
