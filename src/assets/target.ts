import 'phaser'

let cheeseGenerated = false
export class Target extends Phaser.GameObjects.Ellipse {
    scene: Phaser.Scene;
    x: number;
    y: number;
    color: number;
    target: Phaser.GameObjects.Sprite;
    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, color: number = 0xffffff) {
        super(scene, x, y, 10, 10, color);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.color = color;
    }
    createTexture(){
        if(!cheeseGenerated){
            let bar = [
                "........",
                "........",
                ".....888",
                "...88778",
                ".8888788",
                "88777778",
                "87787778",
                "88888888"
            ]
    
              this.scene.textures.generate(`cheese`, {
                  data : bar,
                  pixelWidth : 8
              });
              cheeseGenerated = true;
        }
        
    }
    draw() {

        this.createTexture();
        this.target = this.scene.add.sprite(this.x, this.y, `cheese`).setOrigin(0).setDepth(15);
        // console.log(`target: ${this.x}, ${this.y}`);
        // this.target = this.scene.add.ellipse(this.x + 10, this.y + 10, 75, 75, 0xff0000).setOrigin(0).setDepth(10);
        // let w = this.scene.add.ellipse(this.x + 25, this.y + 25, 50, 50, 0xffffff).setOrigin(0).setDepth(10);
        // let u = this.scene.add.ellipse(this.x + 37, this.y + 40, 25, 25, 0x0000ff).setOrigin(0).setDepth(10);
    
    }
   
}