import { Container, Graphics } from 'pixi.js';
import { Button, createInput, createPanelBackground, createText, theme } from './widgets';

const WIDTH = 280;
const PADDING = 16;

export interface PlacementHandlers {
  onConfirm(name: string, species: string): void;
}

// Modal shown when the player clicks a free tile: asks what to plant there.
export class PlacementDialog extends Container {
  private readonly overlay = new Graphics();
  private readonly dialog = new Container();
  private screenWidth = 0;
  private screenHeight = 0;

  private readonly handlers: PlacementHandlers;

  constructor(handlers: PlacementHandlers) {
    super();
    this.handlers = handlers;
    this.addChild(this.overlay, this.dialog);
    this.visible = false;
  }

  get isOpen(): boolean {
    return this.visible;
  }

  layout(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
    this.overlay.clear().rect(0, 0, width, height).fill({ color: theme.overlay, alpha: 0.35 });
    this.overlay.eventMode = 'static';
    this.centre();
  }

  show(tileX: number, tileY: number): void {
    this.dialog.removeChildren().forEach((child) => child.destroy({ children: true }));
    const innerWidth = WIDTH - PADDING * 2;

    const title = createText('Add plant', { fontSize: 16, fontWeight: '700' });
    title.position.set(PADDING, PADDING);
    const location = createText(`Tile ${tileX}, ${tileY}`, { fontSize: 12, fill: theme.muted });
    location.position.set(PADDING, title.y + title.height + 2);

    const nameInput = createInput(innerWidth, 'Name');
    nameInput.position.set(PADDING, location.y + location.height + 12);
    const speciesInput = createInput(innerWidth, 'Species');
    speciesInput.position.set(PADDING, nameInput.y + 38);

    const error = createText('Name and species are required.', { fontSize: 11, fill: theme.danger });
    error.position.set(PADDING, speciesInput.y + 36);
    error.visible = false;

    const buttonY = error.y + error.height + 8;
    const halfWidth = (innerWidth - 8) / 2;
    const confirm = new Button('Add', halfWidth, 30, () => {
      const name = nameInput.value.trim();
      const species = speciesInput.value.trim();
      if (!name || !species) {
        error.visible = true;
        return;
      }
      this.hide();
      this.handlers.onConfirm(name, species);
    });
    confirm.position.set(PADDING, buttonY);
    const cancel = new Button('Cancel', halfWidth, 30, () => this.hide(), 'neutral');
    cancel.position.set(PADDING + halfWidth + 8, buttonY);

    this.dialog.addChild(
      createPanelBackground(WIDTH, buttonY + 30 + PADDING),
      title,
      location,
      nameInput,
      speciesInput,
      error,
      confirm,
      cancel,
    );
    this.visible = true;
    this.centre();
  }

  hide(): void {
    this.visible = false;
    // Destroying the inputs releases their hidden native <input> elements.
    this.dialog.removeChildren().forEach((child) => child.destroy({ children: true }));
  }

  private centre(): void {
    this.dialog.position.set(
      Math.round((this.screenWidth - this.dialog.width) / 2),
      Math.round((this.screenHeight - this.dialog.height) / 2),
    );
  }
}
