import { Container, Graphics } from 'pixi.js';
import { createText } from './widgets';

const DISPLAY_MS = 4000;

// Short-lived error message pinned to the top of the viewport.
export class Toast extends Container {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private viewport = { x: 0, width: 0 };

  show(message: string): void {
    this.removeChildren().forEach((child) => child.destroy({ children: true }));

    const text = createText(message, { fill: 0x7a1f1f });
    const bg = new Graphics()
      .roundRect(0, 0, text.width + 24, text.height + 16, 6)
      .fill(0xffe0e0)
      .stroke({ width: 1, color: 0xcc6666 });
    text.position.set(12, 8);
    this.addChild(bg, text);
    this.visible = true;
    this.reposition();

    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.hide(), DISPLAY_MS);
  }

  hide(): void {
    clearTimeout(this.timer);
    this.visible = false;
  }

  layout(viewportX: number, viewportWidth: number): void {
    this.viewport = { x: viewportX, width: viewportWidth };
    this.reposition();
  }

  private reposition(): void {
    this.position.set(
      Math.round(this.viewport.x + (this.viewport.width - this.width) / 2),
      12,
    );
  }
}
