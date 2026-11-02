import { Container, Graphics } from 'pixi.js';
import { ScrollBox } from '@pixi/ui';
import type { Store } from '../state/store';
import { Button, createPanelBackground, createText, theme } from './widgets';

const PADDING = 12;
const HEADER_HEIGHT = 40;

// In-game left panel listing all plants. Plants are added by clicking a free
// tile on the map.
export class LeftSidebar extends Container {
  static readonly WIDTH = 240;

  private readonly background = new Container();
  private readonly content = new Container();
  private scrollBox: ScrollBox | null = null;
  private panelHeight = 0;

  private readonly store: Store;
  private readonly onClose: () => void;

  constructor(store: Store, onClose: () => void) {
    super();
    this.store = store;
    this.onClose = onClose;
    this.visible = false;
    this.addChild(this.background, this.content);

    store.subscribe(() => this.refresh());
  }

  get isOpen(): boolean {
    return this.visible;
  }

  open(): void {
    this.visible = true;
    this.refresh();
  }

  close(): void {
    this.visible = false;
  }

  layout(height: number): void {
    this.panelHeight = height;
    this.background.removeChildren().forEach((child) => child.destroy());
    this.background.addChild(createPanelBackground(LeftSidebar.WIDTH, height, 0));
    this.refresh();
  }

  private refresh(): void {
    if (this.panelHeight === 0) return;

    this.scrollBox?.destroy({ children: true });
    this.scrollBox = null;
    this.content.removeChildren().forEach((child) => child.destroy({ children: true }));

    const title = createText('Plants', { fontSize: 18, fontWeight: '700' });
    title.position.set(PADDING, PADDING);
    const close = new Button('Close', 56, 28, () => this.onClose(), 'neutral');
    close.position.set(LeftSidebar.WIDTH - PADDING - 56, PADDING - 2);
    this.content.addChild(title, close);

    const listTop = HEADER_HEIGHT + PADDING;
    const itemWidth = LeftSidebar.WIDTH - PADDING * 2;
    const selectedId = this.store.details?.id;
    const items = this.store.plants.map((plant) => {
      const item = new Container();
      const bg = new Graphics()
        .roundRect(0, 0, itemWidth, 44, 6)
        .fill(plant.id === selectedId ? theme.cardSelected : theme.card);
      const name = createText(plant.name, { fontWeight: '600' });
      name.position.set(10, 5);
      const species = createText(plant.species, { fontSize: 12, fill: theme.muted, fontStyle: 'italic' });
      species.position.set(10, 24);
      item.addChild(bg, name, species);
      item.eventMode = 'static';
      item.cursor = 'pointer';
      item.on('pointertap', () => void this.store.viewDetails(plant.id));
      return item;
    });

    if (items.length === 0) {
      const empty = createText('No plants yet - click a tile on the map to add one.', { fill: theme.muted, fontSize: 13 });
      empty.position.set(PADDING, listTop);
      this.content.addChild(empty);
      return;
    }

    this.scrollBox = new ScrollBox({
      width: itemWidth,
      height: Math.max(0, this.panelHeight - listTop - PADDING),
      items,
      type: 'vertical',
      elementsMargin: 6,
      globalScroll: false,
    });
    this.scrollBox.position.set(PADDING, listTop);
    this.content.addChild(this.scrollBox);
  }
}
