import 'phaser';
import { Target } from './target';

export class GridCell extends Phaser.GameObjects.Rectangle {

    id: number;
    scene: Phaser.Scene;
    x: number;
    y: number;
    q: number;
    color: number;
    status: number;
    cell: Phaser.GameObjects.Rectangle;
    size: number;
    target: boolean;

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, id: number = 0, size: number = 10, status: number = 0, color: number){
        super(scene, x, y, size, size, 0x000000);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.q = 0;
        this.status = 0;
        this.color = color;
        this.id = id;
        this.size = size;
        this.draw();
    }
    draw() {
        this.cell = this.scene.add.rectangle(this.x, this.y, this.size, this.size, this.color).setOrigin(0);
    }
    setTarget() {
        this.target = true;
        let tar = new Target(this.scene, this.x + 50, this.y + 50, 0x00ff00);
        tar.draw();
        
    }
    setColor(color){
        this.color = color;
        this.cell.setFillStyle(this.color);
        console.log(this.color);
    }
    updateStatus(status) {
        this.status = status;
    }
    update() {
        this.cell.setFillStyle(this.color);
    }
}