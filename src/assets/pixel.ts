
export default class Pixel extends Phaser.GameObjects.Rectangle {
    public defaultColor: number = 0xc1c1c1;
    public colorCode: string;

    isOdd(num) { return num % 2; }
    constructor(scene: Phaser.Scene | any, x: number, y: number, ind: number, row: number, showGrid?: boolean) {
        super(scene, x, y, 20, 20, 0xFFFFFF);
        scene.add.existing(this);
        // console.log(scene.showGridLines);
        this.colorCode = '.';
        this.setAlpha(.5)
    

            if(this.isOdd(row)){

                if(this.isOdd(ind)){
                    this.fillColor = 0xc1c1c1;
                } else {
                    this.fillColor = 0x7f7f7f;
                }
            } else {

                if(!this.isOdd(ind)){
                    this.fillColor = 0xc1c1c1;
                } else {
                    this.fillColor = 0x7f7f7f;
                }
            }

    



        this.setInteractive().on('pointerdown', () => {
            this.setAlpha(1);
            if(this.fillColor !== this.defaultColor){
                this.fillColor = scene.currentColor;  
            } else {
                this.setAlpha(.5)
                this.fillColor = this.defaultColor;  
            }
               
        })
    }
    public setColor(color: number){
        this.fillColor = color;
    }
    public resetToDefault(){
        this.colorCode = '.';
        this.setAlpha(.5)
        this.fillColor = this.defaultColor;
    }


}