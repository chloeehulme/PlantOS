import { GameWorld } from './game/GameWorld';
import { Store } from './state/store';
import { Button } from './ui/widgets';
import { LeftSidebar } from './ui/LeftSidebar';
import { PlacementDialog } from './ui/PlacementDialog';
import { PlantActionMenu } from './ui/PlantActionMenu';
import { RightSidebar } from './ui/RightSidebar';
import { Toast } from './ui/Toast';
import type { Container } from 'pixi.js';
import type { Plant } from './models/Plant';

// Wires the game world, the shared store and the in-game Pixi UI together.
export class GameApp {
  private readonly store = new Store();
  private readonly world: GameWorld;
  private readonly leftSidebar = new LeftSidebar(this.store, () => this.setLeftSidebarOpen(false));
  private readonly allPlantsButton = new Button('All Plants', 100, 32, () => this.setLeftSidebarOpen(true));
  private readonly rightSidebar = new RightSidebar(this.store);
  private readonly toast = new Toast();
  private readonly placementDialog = new PlacementDialog({
    onConfirm: (name, species) => {
      if (this.pendingTile) void this.placePlant(name, species, this.pendingTile.tileX, this.pendingTile.tileY);
      this.pendingTile = null;
    },
  });
  private readonly actionMenu = new PlantActionMenu({
    onAddEvent: (plantId, route, occurredAt) => this.store.addEvent(plantId, route, occurredAt),
    onViewEvents: (plantId) => void this.store.viewDetails(plantId),
    onDeletePlant: (plantId) => void this.deletePlant(plantId),
    onClose: () => this.store.closeDetails(),
  });

  private pendingTile: { tileX: number; tileY: number } | null = null;
  private approachingPlant: Plant | null = null;
  private rightSidebarWasOpen = false;

  constructor() {
    this.world = new GameWorld({
      onPlacementCandidate: (tileX, tileY) => this.handlePlacementCandidate(tileX, tileY),
      onPlacementBlocked: (reason) => this.store.setError(reason),
      onApproachingPlant: (plant) => this.handleApproachingPlant(plant),
      onInteractionWithPlant: () => {
        this.actionMenu.openMenu();
        this.world.isEKeyPressed = false;
      },
      isPointerBlocked: (x, y) => this.isPointerOverUi(x, y),
      onResize: () => this.layout(),
    });

    this.store.subscribe(() => this.handleStoreChange());
  }

  async start(host: HTMLElement): Promise<void> {
    const plants = await this.store.loadPlants();
    await this.world.init(host, plants);

    this.world.uiLayer.addChild(
      this.leftSidebar,
      this.allPlantsButton,
      this.rightSidebar,
      this.actionMenu,
      this.toast,
      this.placementDialog,
    );
    this.layout();
    if (this.store.error) this.toast.show(this.store.error);
  }

  private handleStoreChange(): void {
    if (this.store.error) {
      this.toast.show(this.store.error);
      this.store.error = null;
    }
    // The right sidebar opening/closing changes how much room the map has.
    if (this.rightSidebar.isOpen !== this.rightSidebarWasOpen) this.layout();
  }

  private handlePlacementCandidate(tileX: number, tileY: number): void {
    this.pendingTile = { tileX, tileY };
    this.placementDialog.show(tileX, tileY);
  }

  private async placePlant(name: string, species: string, tileX: number, tileY: number): Promise<void> {
    const plant = await this.store.addPlant(name, species, tileX, tileY);
    if (plant) this.world.addPlant(plant);
  }

  private async deletePlant(plantId: string): Promise<void> {
    if (await this.store.deletePlant(plantId)) this.world.deletePlant(plantId);
  }

  private handleApproachingPlant(plant: Plant | null): void {
    if (plant?.id === this.approachingPlant?.id) return;
    const left = this.approachingPlant;
    this.approachingPlant = plant;
    if (left && this.store.details?.id === left.id) this.store.closeDetails();
    this.actionMenu.setPlant(plant);
    this.positionActionMenu();
  }

  private layout(): void {
    const { width, height } = this.world.screenSize;
    this.leftSidebar.layout(height);
    this.allPlantsButton.visible = !this.leftSidebar.isOpen;
    this.allPlantsButton.position.set(12, 12);
    this.rightSidebar.layout(width, height);
    this.placementDialog.layout(width, height);

    this.rightSidebarWasOpen = this.rightSidebar.isOpen;
    const viewport = this.viewport();
    this.world.setViewport(viewport);
    this.toast.layout(viewport.x, viewport.width);
    this.positionActionMenu();
  }

  private setLeftSidebarOpen(open: boolean): void {
    if (open) this.leftSidebar.open();
    else this.leftSidebar.close();
    this.layout();
  }

  private viewport() {
    const { width, height } = this.world.screenSize;
    const left = this.leftSidebar.isOpen ? LeftSidebar.WIDTH : 0;
    const right = this.rightSidebar.isOpen ? RightSidebar.WIDTH : 0;
    return { x: left, y: 0, width: Math.max(0, width - left - right), height };
  }

  private positionActionMenu(): void {
    if (!this.approachingPlant) return;
    const { tileX, tileY } = this.approachingPlant;
    this.actionMenu.place(this.world.tileToScreen(tileX, tileY), this.viewport());
  }

  private isPointerOverUi(x: number, y: number): boolean {
    const panels: Container[] = [this.leftSidebar, this.allPlantsButton, this.rightSidebar, this.actionMenu, this.placementDialog];
    return panels.some((panel) => panel.visible && panel.getBounds().rectangle.contains(x, y));
  }

  destroy(): void {
    this.world.destroy();
  }
}
