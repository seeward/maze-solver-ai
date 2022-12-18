import 'phaser'

export class Target extends Phaser.GameObjects.Ellipse {
    scene: Phaser.Scene;
    x: number;
    y: number;
    color: number;
    target: Phaser.GameObjects.Ellipse;
    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, color: number = 0xffffff) {
        super(scene, x, y, 10, 10, color);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.color = color;
    }
    draw() {
        console.log(`target: ${this.x}, ${this.y}`);
        this.target = this.scene.add.ellipse(this.x, this.y, 75, 75, this.color).setOrigin(0).setDepth(10);
    }
   
}