

export default class Intro extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.scene = scene
        this.scene.add.existing(this);
        this.draw();
    }
    draw() {
        let text = this.scene.add.text(this.x,this.x, "Welcome to Maze Solver AI", { fontSize: "32px", color: '#ffffff' });
    }
}