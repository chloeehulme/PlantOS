import { Container, Graphics, Rectangle, Text, type TextStyleOptions } from 'pixi.js';
import { Input } from '@pixi/ui';

export const theme = {
  font: 'system-ui, "Segoe UI", Roboto, sans-serif',
  panel: 0xfdfbf4,
  panelBorder: 0xc9c3b0,
  card: 0xf0ede0,
  cardSelected: 0xdcebd0,
  text: 0x222222,
  muted: 0x777777,
  primary: 0x2d7a2d,
  primaryHover: 0x3a933a,
  danger: 0xb03a3a,
  dangerHover: 0xc94b4b,
  neutral: 0x8a8672,
  neutralHover: 0xa09c88,
  disabled: 0xbdbdbd,
  overlay: 0x000000,
} as const;

export function createText(text: string, options: Partial<TextStyleOptions> = {}): Text {
  return new Text({
    text,
    style: { fontFamily: theme.font, fontSize: 14, fill: theme.text, ...options },
  });
}

// A rounded, bordered rectangle that swallows pointer events so clicks on a
// panel never fall through to whatever is drawn behind it.
export function createPanelBackground(width: number, height: number, radius = 8): Graphics {
  const bg = new Graphics()
    .roundRect(0, 0, width, height, radius)
    .fill(theme.panel)
    .stroke({ width: 1, color: theme.panelBorder });
  bg.eventMode = 'static';
  return bg;
}

type ButtonVariant = 'primary' | 'danger' | 'neutral';

const VARIANT_COLOURS: Record<ButtonVariant, { base: number; hover: number }> = {
  primary: { base: theme.primary, hover: theme.primaryHover },
  danger: { base: theme.danger, hover: theme.dangerHover },
  neutral: { base: theme.neutral, hover: theme.neutralHover },
};

export class Button extends Container {
  private readonly bg = new Graphics();
  private readonly caption: Text;
  private readonly buttonWidth: number;
  private readonly buttonHeight: number;
  private readonly variant: ButtonVariant;
  private hovered = false;
  private enabled = true;

  constructor(
    text: string,
    buttonWidth: number,
    buttonHeight: number,
    onClick: () => void,
    variant: ButtonVariant = 'primary',
  ) {
    super();
    this.buttonWidth = buttonWidth;
    this.buttonHeight = buttonHeight;
    this.variant = variant;
    this.caption = createText(text, { fill: 0xffffff, fontSize: 13, fontWeight: '600' });
    this.addChild(this.bg, this.caption);

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerover', () => this.setHovered(true));
    this.on('pointerout', () => this.setHovered(false));
    this.on('pointertap', () => {
      if (this.enabled) onClick();
    });
    this.redraw();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.cursor = enabled ? 'pointer' : 'default';
    this.redraw();
  }

  private setHovered(hovered: boolean): void {
    this.hovered = hovered;
    this.redraw();
  }

  private redraw(): void {
    const colours = VARIANT_COLOURS[this.variant];
    const fill = !this.enabled ? theme.disabled : this.hovered ? colours.hover : colours.base;
    this.bg.clear().roundRect(0, 0, this.buttonWidth, this.buttonHeight, 6).fill(fill);
    this.caption.position.set(
      (this.buttonWidth - this.caption.width) / 2,
      (this.buttonHeight - this.caption.height) / 2,
    );
  }
}

// @pixi/ui Input backed by a hidden native <input>, so typing, paste and
// IME all work normally.
export function createInput(width: number, placeholder: string, value = ''): Input {
  const height = 30;
  const input = new Input({
    bg: new Graphics()
      .roundRect(0, 0, width, height, 6)
      .fill(0xffffff)
      .stroke({ width: 1, color: theme.panelBorder }),
    placeholder,
    value,
    padding: [6, 8],
    addMask: true,
    textStyle: { fontFamily: theme.font, fontSize: 14, fill: theme.text },
  });
  input.eventMode = 'static';
  input.cursor = 'text';
  return input;
}

const DROPDOWN_ROW_HEIGHT = 28;

// A closed box showing the current choice; clicking it opens a list of options
// drawn over whatever is below. Add it to its parent last so the list is on top.
export class Dropdown extends Container {
  private readonly box = new Graphics();
  private readonly caption: Text;
  private readonly list = new Container();
  private readonly options: string[];
  private readonly boxWidth: number;
  private selectedIndex = -1;

  constructor(width: number, options: string[], placeholder: string) {
    super();
    this.boxWidth = width;
    this.options = options;
    this.caption = createText(placeholder, { fill: theme.muted });
    this.caption.position.set(8, 5);
    const arrow = createText('▾', { fill: theme.muted });
    arrow.position.set(width - 20, 5);

    this.box
      .roundRect(0, 0, width, 30, 6)
      .fill(0xffffff)
      .stroke({ width: 1, color: theme.panelBorder });
    this.box.eventMode = 'static';
    this.box.cursor = 'pointer';
    this.box.on('pointertap', () => (this.list.visible = !this.list.visible));

    this.buildList();
    this.list.visible = false;
    this.addChild(this.box, this.caption, arrow, this.list);
  }

  get value(): string | null {
    return this.selectedIndex >= 0 ? this.options[this.selectedIndex] : null;
  }

  private buildList(): void {
    this.list.position.set(0, 32);
    const bg = new Graphics()
      .roundRect(0, 0, this.boxWidth, this.options.length * DROPDOWN_ROW_HEIGHT, 6)
      .fill(0xffffff)
      .stroke({ width: 1, color: theme.panelBorder });
    bg.eventMode = 'static';
    this.list.addChild(bg);

    this.options.forEach((option, index) => {
      const row = new Container();
      row.position.set(0, index * DROPDOWN_ROW_HEIGHT);
      const highlight = new Graphics().rect(1, 0, this.boxWidth - 2, DROPDOWN_ROW_HEIGHT).fill(theme.cardSelected);
      highlight.visible = false;
      const label = createText(option);
      label.position.set(8, 4);
      row.addChild(highlight, label);
      row.eventMode = 'static';
      row.cursor = 'pointer';
      row.hitArea = new Rectangle(0, 0, this.boxWidth, DROPDOWN_ROW_HEIGHT);
      row.on('pointerover', () => (highlight.visible = true));
      row.on('pointerout', () => (highlight.visible = false));
      row.on('pointertap', () => {
        this.selectedIndex = index;
        this.caption.text = option;
        this.caption.style.fill = theme.text;
        this.list.visible = false;
      });
      this.list.addChild(row);
    });
  }
}
