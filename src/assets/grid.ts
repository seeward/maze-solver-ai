import 'phaser';
import { GridCell } from './gridCell';

export class MainGrid extends Phaser.GameObjects.Rectangle {
    scene: Phaser.Scene;
    x: number;
    y: number;
    gridSize: number;
    grid: GridCell[];

    constructor(scene:Phaser.Scene, x: number = 0, y: number = 0, gridSize: number = 10) {
        super(scene, x, y, gridSize, gridSize, 0xffffff);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.gridSize = gridSize;
        this.grid = this.createGrid();
        this.setTarget();
        
    }
    setTarget(){
        let rand_target = Math.floor(Math.random() * this.grid.length);
        this.grid[rand_target].setTarget();
    }
    createGrid(): any {
        let grid = [];
        let idCounter = 0
        let rand_target = 50;
        let bg = getRandomColor('light')
        let wall = getRandomColor('dark')

        for (let i = 0; i < this.gridSize; i++) {

            let multiX = i * this.gridSize

            for (let j = 0; j < this.gridSize; j++) {

                let multiY = j * this.gridSize

                let rand = Math.floor(Math.random() * 5);

                if(rand === 1 || rand === 2 || rand === 3 || rand === 4) {

                    grid.push(new GridCell(this.scene, multiX , multiY, idCounter, 100, 0, Number(`0x${bg}`)));

                } else {

                    grid.push(new GridCell(this.scene, multiX , multiY, idCounter, 100, 4, Number(`0x${wall}`)))

                }
                idCounter++;
            }
            
        }

        
        return grid;
    }

    update() {
        for (let i = 0; i < this.grid.length; i++) {
            // console.log(this.grid[i].id, d);
            this.grid[i].update();
        }
    }

}


function getRandomColor(color) {
    let r, g, b;
    switch (color) {
        case "light":
            r = Math.floor(Math.random() * 255);
            g = Math.floor(Math.random() * 255);
            b = Math.floor(Math.random() * 255);
            break;
        case "dark":
            r = Math.floor(Math.random() * 100);
            g = Math.floor(Math.random() * 100);
            b = Math.floor(Math.random() * 100);
            break;
        case "medium":
            r = Math.floor(Math.random() * 155) + 100;
            g = Math.floor(Math.random() * 155) + 100;
            b = Math.floor(Math.random() * 155) + 100;
            break;
    }
    return rgbToHex(r,g,b)
}

// function to return a hex color string for a given rgb value
function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}