import 'phaser';
import { MainGrid } from '../assets/grid';

export default class MainScene extends Phaser.Scene {
    grid: MainGrid;
    constructor() {
        super('main');
    }

    preload() {

    }

    create() {
        this.grid = new MainGrid(this, 0, 0, 100);
    }
    update(time: number, delta: number): void {
        
        this.grid.update();
    
    }
}