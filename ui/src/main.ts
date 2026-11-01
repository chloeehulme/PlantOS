import './index.css';
import { GameApp } from './GameApp';

const host = document.getElementById('app')!;
const app = new GameApp();
void app.start(host);

import.meta.hot?.dispose(() => app.destroy());
