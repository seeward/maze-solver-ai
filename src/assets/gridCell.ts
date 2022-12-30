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
    target: boolean = false;
    startCell: boolean = false;
    targetCell: GridCell = undefined;
    col: number;
    row: number;
    reward: number = 0;


    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, id: number = 0, size: number = 10, status: number = 0, color: number, col?: number, row?: number) {
        super(scene, x, y, size, size, color);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.q = 0;
        this.status = status;  // 0 == wall, 4 === path, 2 === target
        
        this.id = id;
        this.size = size;
        this.col = col;
        this.row = row;
        this.name = `cell-${this.id}-x${this.x}-y${this.y}`;
        this.draw();
        this.setColor(color);
    }
    draw() {
        this.cell = this.scene.add.rectangle(this.x, this.y, this.size, this.size, this.color).setOrigin(0);
    }
    setStartCell() {
        this.startCell = true;
        this.color = 0xffffff;
    }
    setTarget() {
        this.target = true;
        this.status = 2;
        let tar = new Target(this.scene, this.x, this.y, 0x00ff00);
        tar.draw();
    }
    setColor(color) {
        this.color = color;
        this.cell.setFillStyle(this.color);
        this.update()
        // console.log(this.color);
    }
    updateStatus(status) {

        this.status = status;
        // console.log(`status: ${this.status}`);
        
        this.reward = this.status === 0 ?  -1 : 20 - this.q 
    }
    update() {
        this.cell.setFillStyle(this.color);
    }
    getQ() {
        return this.q;
    }
    setTargetCell(cell) {
        this.targetCell = cell;
        this.calculateDistanceToTarget();
    }
    calculateDistanceToTarget() {

        let distanceH = this.targetCell.col - this.col;
        let distanceV = this.targetCell.row - this.row;
        this.q = distanceH + distanceV;

        
        // this.drawIndexes();
        return this.q;
    }
    drawIndexes() {

        let ellipse = this.scene.add.ellipse(this.x + 10, this.y + 10, 20, 20, 0xffffff, 1);
        let t = this.scene.add.text(this.x + 2, this.y + 5, this.id.toString(), { color: '#000000', fontSize: '12px' });
        let t2 = this.scene.add.text(this.x + 25, this.y + 10, this.getQ().toString(), { color: '#ffffff', fontSize: '20px' });
        // let t3 = this.scene.add.text(this.x + 50, this.y + 10, this.status.toString(), { color: '#ffffff', fontSize: '30px' });

    }
    getReward() {
        return this.status === 0 ?  -1 : 20 - this.q;
        
    }
    

}