import { Container } from 'pixi.js';
import type { AddableEventRoute } from '../api';
import type { Plant } from '../models/Plant';
import { Button, createInput, createPanelBackground, createText, theme } from './widgets';

const ADDABLE_EVENTS: { route: AddableEventRoute; label: string }[] = [
  { route: 'water', label: 'Water' },
  { route: 'fertilise', label: 'Fertilise' },
];

const WIDTH = 200;
const PADDING = 10;
const BUTTON_HEIGHT = 28;
const GAP = 6;

type Mode = 'menu' | 'event-type' | 'event-when' | 'custom-time' | 'delete-confirm';

export interface ActionMenuHandlers {
  onAddEvent(plantId: string, route: AddableEventRoute, occurredAt?: Date): Promise<boolean>;
  onViewEvents(plantId: string): void;
  onDeletePlant(plantId: string): void;
  onClose(): void;
}

export interface Anchor {
  x: number;
  top: number;
  bottom: number;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatLocalDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Parses "YYYY-MM-DD HH:mm" (local time). Returns null for malformed or
// impossible dates (e.g. month 13) and for times in the future.
export function parseLocalDateTime(text: string, now = new Date()): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(text.trim());
  if (!match) return null;

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  const roundTrips =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute;

  return roundTrips && date <= now ? date : null;
}

// Floating in-game menu anchored to the plant the player is standing next to.
// Collapsed it just shows the plant's name; opened (E key) it offers actions.
export class PlantActionMenu extends Container {
  private plant: Plant | null = null;
  private open = false;
  private mode: Mode = 'menu';
  private route: AddableEventRoute | null = null;
  private anchor: Anchor | null = null;
  private viewport = { x: 0, y: 0, width: 0, height: 0 };
  private busy = false;

  private readonly handlers: ActionMenuHandlers;

  constructor(handlers: ActionMenuHandlers) {
    super();
    this.handlers = handlers;
    this.visible = false;
  }

  get isOpen(): boolean {
    return this.open;
  }

  setPlant(plant: Plant | null): void {
    if (plant?.id === this.plant?.id) return;
    const wasOpen = this.open;
    this.plant = plant;
    this.open = false;
    this.resetFlow();
    this.visible = plant !== null;
    this.rebuild();
    if (wasOpen) this.handlers.onClose();
  }

  openMenu(): void {
    if (!this.plant || this.open) return;
    this.open = true;
    this.resetFlow();
    this.rebuild();
  }

  place(anchor: Anchor, viewport: { x: number; y: number; width: number; height: number }): void {
    this.anchor = anchor;
    this.viewport = viewport;
    this.updatePosition();
  }

  private resetFlow(): void {
    this.mode = 'menu';
    this.route = null;
  }

  private setMode(mode: Mode): void {
    this.mode = mode;
    this.rebuild();
  }

  private close(): void {
    this.open = false;
    this.resetFlow();
    this.rebuild();
    this.handlers.onClose();
  }

  private async submit(route: AddableEventRoute, occurredAt?: Date): Promise<void> {
    if (!this.plant || this.busy) return;
    this.busy = true;
    const plantId = this.plant.id;
    const ok = await this.handlers.onAddEvent(plantId, route, occurredAt);
    this.busy = false;
    if (ok && this.plant?.id === plantId) this.close();
  }

  private rebuild(): void {
    this.removeChildren().forEach((child) => child.destroy({ children: true }));
    const plant = this.plant;
    if (!plant) return;

    const body = new Container();
    const innerWidth = WIDTH - PADDING * 2;
    let y = PADDING;

    const name = createText(plant.name, { fontWeight: '700', wordWrap: true, wordWrapWidth: innerWidth });
    name.position.set(PADDING, y);
    const species = createText(plant.species, { fontSize: 12, fill: theme.muted, fontStyle: 'italic' });
    species.position.set(PADDING, y + name.height);
    body.addChild(name, species);
    y += name.height + species.height + 8;

    const hint = createText('Press E to interact', { fontSize: 11, fill: theme.muted });
    if (!this.open) {
      hint.position.set(PADDING, y - 2);
      body.addChild(hint);
      y += hint.height + 4;
    }

    const addButton = (label: string, onClick: () => void, variant?: 'primary' | 'danger' | 'neutral') => {
      const button = new Button(label, innerWidth, BUTTON_HEIGHT, onClick, variant);
      button.position.set(PADDING, y);
      body.addChild(button);
      y += BUTTON_HEIGHT + GAP;
      return button;
    };

    if (this.open) {
      switch (this.mode) {
        case 'menu':
          addButton('Add event', () => this.setMode('event-type'));
          addButton('View events', () => this.handlers.onViewEvents(plant.id));
          addButton('Delete plant', () => this.setMode('delete-confirm'), 'danger');
          addButton('Exit', () => this.close(), 'neutral');
          break;

        case 'event-type':
          ADDABLE_EVENTS.forEach(({ route, label }) =>
            addButton(label, () => {
              this.route = route;
              this.setMode('event-when');
            }),
          );
          addButton('Back', () => this.setMode('menu'), 'neutral');
          break;

        case 'event-when':
          addButton('Now', () => void this.submit(this.route!));
          addButton('Specific time', () => this.setMode('custom-time'));
          addButton('Back', () => this.setMode('event-type'), 'neutral');
          break;

        case 'custom-time': {
          const label = createText('Local time (YYYY-MM-DD HH:mm)', { fontSize: 11, fill: theme.muted });
          label.position.set(PADDING, y);
          body.addChild(label);
          y += label.height + 4;

          const input = createInput(innerWidth, 'YYYY-MM-DD HH:mm', formatLocalDateTime(new Date()));
          input.position.set(PADDING, y);
          body.addChild(input);
          y += 30 + GAP;

          const error = createText('Enter a valid past date and time.', { fontSize: 11, fill: theme.danger });
          error.position.set(PADDING, y);
          error.visible = false;
          body.addChild(error);
          y += error.height + GAP;

          addButton('Confirm', () => {
            const date = parseLocalDateTime(input.value);
            error.visible = date === null;
            if (date) void this.submit(this.route!, date);
          });
          addButton('Back', () => this.setMode('event-when'), 'neutral');
          break;
        }

        case 'delete-confirm': {
          const prompt = createText('Are you sure?', { fontSize: 13 });
          prompt.position.set(PADDING, y);
          body.addChild(prompt);
          y += prompt.height + GAP;
          addButton('Yes', () => {
            this.handlers.onDeletePlant(plant.id);
            this.close();
          }, 'danger');
          addButton('No', () => this.setMode('menu'), 'neutral');
          break;
        }
      }
    }

    this.addChild(createPanelBackground(WIDTH, y + PADDING - GAP), body);
    this.updatePosition();
  }

  private updatePosition(): void {
    if (!this.anchor || !this.plant) return;

    const height = this.height;
    const above = this.anchor.top - height - 4;
    const below = this.anchor.bottom + 4;
    const preferredY = above >= this.viewport.y ? above : below;

    const minX = this.viewport.x;
    const maxX = Math.max(minX, this.viewport.x + this.viewport.width - WIDTH);
    const minY = this.viewport.y;
    const maxY = Math.max(minY, this.viewport.y + this.viewport.height - height);

    this.position.set(
      Math.min(Math.max(this.anchor.x - WIDTH / 2, minX), maxX),
      Math.min(Math.max(preferredY, minY), maxY),
    );
  }
}
