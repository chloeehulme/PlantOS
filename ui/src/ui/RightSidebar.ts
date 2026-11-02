import { Container, Graphics } from 'pixi.js';
import { ScrollBox } from '@pixi/ui';
import { PlantEventTypeLabels } from '../models/PlantEvent';
import type { Store } from '../state/store';
import { Button, createPanelBackground, createText, theme } from './widgets';

const PADDING = 12;

// In-game right panel: the selected plant's event history, with select +
// confirm-to-delete on each event. Only visible while a plant is selected.
export class RightSidebar extends Container {
  static readonly WIDTH = 300;

  private readonly background = new Container();
  private readonly content = new Container();
  private scrollBox: ScrollBox | null = null;
  private selectedEventId: string | null = null;
  private confirmingDelete = false;
  private panelHeight = 0;
  private shownPlantId: string | null = null;

  private readonly store: Store;

  constructor(store: Store) {
    super();
    this.store = store;
    this.addChild(this.background, this.content);
    this.visible = false;
    store.subscribe(() => this.refresh());
  }

  get isOpen(): boolean {
    return this.visible;
  }

  layout(width: number, height: number): void {
    this.panelHeight = height;
    this.x = width - RightSidebar.WIDTH;
    this.background.removeChildren().forEach((child) => child.destroy());
    this.background.addChild(createPanelBackground(RightSidebar.WIDTH, height, 0));
    this.refresh();
  }

  private refresh(): void {
    const plant = this.store.details;
    this.visible = plant !== null;

    this.scrollBox?.destroy({ children: true });
    this.scrollBox = null;
    this.content.removeChildren().forEach((child) => child.destroy({ children: true }));
    if (!plant || this.panelHeight === 0) return;

    if (plant.id !== this.shownPlantId) {
      this.shownPlantId = plant.id;
      this.selectedEventId = null;
      this.confirmingDelete = false;
    }

    const innerWidth = RightSidebar.WIDTH - PADDING * 2;

    const name = createText(plant.name, { fontSize: 18, fontWeight: '700', wordWrap: true, wordWrapWidth: innerWidth - 36 });
    name.position.set(PADDING, PADDING);
    const species = createText(plant.species, { fontSize: 13, fill: theme.muted, fontStyle: 'italic' });
    species.position.set(PADDING, name.y + name.height + 2);
    const close = new Button('×', 28, 28, () => this.store.closeDetails(), 'neutral');
    close.position.set(RightSidebar.WIDTH - PADDING - 28, PADDING - 2);
    const heading = createText('Event history', { fontSize: 15, fontWeight: '600' });
    heading.position.set(PADDING, species.y + species.height + 14);
    this.content.addChild(name, species, close, heading);

    const listTop = heading.y + heading.height + 8;
    const sortedEvents = [...plant.events].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    if (sortedEvents.length === 0) {
      const empty = createText('No events yet.', { fill: theme.muted, fontSize: 13 });
      empty.position.set(PADDING, listTop);
      this.content.addChild(empty);
      return;
    }

    const items = sortedEvents.map((event) => this.createEventItem(plant.id, event, innerWidth));
    this.scrollBox = new ScrollBox({
      width: innerWidth,
      height: Math.max(0, this.panelHeight - listTop - PADDING),
      items,
      type: 'vertical',
      elementsMargin: 6,
      globalScroll: false,
    });
    this.scrollBox.position.set(PADDING, listTop);
    this.content.addChild(this.scrollBox);
  }

  private createEventItem(
    plantId: string,
    event: NonNullable<Store['details']>['events'][number],
    width: number,
  ): Container {
    const selected = event.id === this.selectedEventId;
    const item = new Container();
    const bg = new Graphics();
    item.addChild(bg);

    const title = createText(PlantEventTypeLabels[event.eventType], { fontWeight: '600' });
    title.position.set(10, 6);
    const date = createText(new Date(event.date).toLocaleString(), { fontSize: 12, fill: theme.muted });
    date.position.set(10, 26);
    item.addChild(title, date);

    let height = 50;
    if (event.notes) {
      const notes = createText(event.notes, {
        fontSize: 13,
        wordWrap: true,
        wordWrapWidth: width - 20,
      });
      notes.position.set(10, height);
      item.addChild(notes);
      height += notes.height + 8;
    }

    if (selected && !this.confirmingDelete) {
      const del = new Button('Delete event', 110, 26, () => {
        this.confirmingDelete = true;
        this.refresh();
      }, 'danger');
      del.position.set(10, height);
      item.addChild(del);
      height += 34;
    } else if (selected) {
      const prompt = createText('Delete this event?', { fontSize: 13 });
      prompt.position.set(10, height + 4);
      const yes = new Button('Yes', 50, 26, () => {
        this.selectedEventId = null;
        this.confirmingDelete = false;
        void this.store.deleteEvent(plantId, event.id);
      }, 'danger');
      yes.position.set(prompt.width + 20, height);
      const no = new Button('No', 50, 26, () => {
        this.confirmingDelete = false;
        this.refresh();
      }, 'neutral');
      no.position.set(yes.x + 58, height);
      item.addChild(prompt, yes, no);
      height += 34;
    }

    bg.roundRect(0, 0, width, height, 6).fill(selected ? theme.cardSelected : theme.card);

    // Card taps toggle selection; child buttons handle their own taps first.
    bg.eventMode = 'static';
    bg.cursor = 'pointer';
    bg.on('pointertap', () => {
      this.selectedEventId = selected ? null : event.id;
      this.confirmingDelete = false;
      this.refresh();
    });
    return item;
  }
}
