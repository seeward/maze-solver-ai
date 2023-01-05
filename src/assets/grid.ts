import 'phaser';
import { GridCell } from './gridCell';

let bg = "ffffff"
let wall = "BCDEE6"

export interface BorderObject {
    top: GridCell[];
    bottom: GridCell[];
    left: GridCell[];
    right: GridCell[];
    flattened: GridCell[];
}
export class MainGrid extends Phaser.GameObjects.Rectangle {

    startCell: number = 0;
    endCell: number = 99;
    scene: Phaser.Scene;
    x: number;
    y: number;
    gridSize: number;
    grid: GridCell[];
    grid2d: GridCell[][];
    gridBorders: BorderObject;
    solutions: number = 0;
    reverse: boolean = false;
    difficulty: number = 1;
    preloadedGrid: any;

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, gridSize: number = 10, difficulty: number = 1, preloadedGrid?: any) {
        super(scene, x, y, gridSize, gridSize, 0xffffff);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.gridSize = gridSize;
        this.difficulty = difficulty;
        this.solutions = 20 / this.difficulty

        if (!preloadedGrid) {
            this.init();
        } else {
            this.preloadedGrid = preloadedGrid;
            this.preloadInit();
        }

    }
    getStartCell() {
        return this.grid[0];
    }
    getTargetCell() {
        return this.grid.filter(cell => cell.target === true)[0];
    }
    setStartCell() {
        // this.grid[0].setColor(0xffffff);
        // this.grid[0].updateStatus(3); // occupied
        // this.grid[0].update();
    }
    setTarget() {
        this.grid[99].setColor(0x00ff00);
        this.grid[99].setTarget();
        this.grid[99].updateStatus(99)
        this.grid.forEach(cell => {
            if (cell.id !== 99) {
                cell.setTargetCell(this.grid[99]);
            }
        })
    }
    createGrid(): any {
        let grid = [];
        let idCounter = 0
        for (let i = 0; i < this.gridSize; i++) {
            let multiX = i * 100
            for (let j = 0; j < this.gridSize; j++) {
                let multiY = j * 100
                // console.log(idCounter);
                if (idCounter === 0) {

                    grid.push(new GridCell(this.scene, multiY, multiX, idCounter, 100, 0, 0xffffff, j + 1, i + 1))

                } else {
                    grid.push(new GridCell(this.scene, multiY, multiX, idCounter, 100, 0, Number(`0x${wall}`), j + 1, i + 1))
                }

                idCounter++;
            }

        }

        return grid;
    }
    // function to create a grid from a 1D array of statues
    createGridFromStatuses(statuses: number[]) {
        let grid = [];
        let idCounter = 0
        for (let i = 0; i < this.gridSize; i++) {
            let multiX = i * 100
            for (let j = 0; j < this.gridSize; j++) {
                let multiY = j * 100
                // console.log(statuses[i]);
                grid.push(new GridCell(this.scene, multiY, multiX, idCounter, 100, statuses[idCounter], statuses[idCounter] === 0 ? 0xBCDEE6 : 0x000000, j + 1, i + 1))
                idCounter++;
            }
        }

        
        return grid;
    }
    getCellById(id) {
        // console.log(id);
        return this.grid.filter(cell => cell.id === id)[0];
    }
    getPosById(id) {
        let cell = this.getCellById(id);
        return [cell.x, cell.y];
    }
    update() {
        for (let i = 0; i < this.grid.length; i++) {
            // console.log(this.grid[i].id, d);
            this.grid[i].update();
        }
    }
    preloadInit() {
        // create grid of grid cells
        this.grid = this.createGridFromStatuses(this.preloadedGrid);
        this.setTarget();
        // make 2D array of grid cells
        this.splitGrid();
        // get the borders of the grid for later reference
        this.getMapBorders();
        this.update();
    }
    init() {
        // create grid of grid cells
        this.grid = this.createGrid();
        // set target cell
        this.setTarget();
        // make 2D array of grid cells
        this.splitGrid();
        // get the borders of the grid for later reference
        this.getMapBorders();
        // draw solution path
        for (let i = 0; i < this.solutions; i++) {
            this.drawSolutionPath();
        }

    }
    splitGrid() {
        // console.log(splitGrid(this.grid));
        this.grid2d = splitGrid(this.grid); // a 2d array of 10 cells each
    }
    getMapBorders() {

        let left = [], right = [], top = [], bottom = [];
        this.grid2d.forEach((element, id) => {
            // each element is an array of 10 cells
            // top row is the first array at index 0
            if (id === 0) {
                top = element;
            }
            // bottom row is the last array at index 9
            if (id === 9) {
                bottom = element;
            }
            // left column is the first cell in each array
            left.push(element[0]);
            // right column is the last cell in each array
            right.push(element[9]);


        });
        this.gridBorders = {
            left,
            right,
            top,
            bottom,
            flattened: [...left, ...right, ...top, ...bottom]
        }
        // console.log(this.gridBorders);
    }
    getGrid() {
        return this.grid;
    }
    drawSolutionPath() {
        let RANDOM_DOWN_DISTANCE = Math.floor(Math.random() * 10);
        if (RANDOM_DOWN_DISTANCE === 0) {
            RANDOM_DOWN_DISTANCE = 4;
        }

        let RANDOM_RIGHT_DISTANCE = Math.floor(Math.random() * 10);
        if (RANDOM_RIGHT_DISTANCE === 0) {
            RANDOM_RIGHT_DISTANCE = 4;
        }

        if (this.reverse) {
            let path = []
            for (let i = 0; i < RANDOM_DOWN_DISTANCE; i++) {
                let cId = i * 10;
                // console.log(cId);
                let cell = this.getCellById(cId);
                cell.setColor(`#${bg}`);
                cell.updateStatus(4)
                // console.log(cell);
                path.push(cell);
            }
            for (let i = 0; i < RANDOM_RIGHT_DISTANCE; i++) {
                let cId = path[path.length - 1].id + 1
                // console.log(cId);
                let cell = this.getCellById(cId);
                cell.setColor(`#${bg}`);
                cell.updateStatus(4)
                // console.log(cell);
                path.push(cell);
            }
            let blocksLeftToBottom = 10 - path[path.length - 1].row;
            for (let i = 0; i < blocksLeftToBottom; i++) {
                let cId = path[path.length - 1].id + 10;
                // console.log(cId);
                let cell = this.getCellById(cId);
                cell.setColor(`#${bg}`);
                cell.updateStatus(4)
                // console.log(cell);
                path.push(cell);
            }
            if (path[path.length - 1].id !== 99) {
                let blocksLeftToRight = 10 - path[path.length - 1].col;
                for (let i = 0; i < blocksLeftToRight; i++) {
                    let cId = path[path.length - 1].id + 1;
                    // console.log(cId);
                    let cell = this.getCellById(cId);
                    cell.setColor(`#${bg}`);
                    cell.updateStatus(4)
                    // console.log(cell);
                    path.push(cell);
                }
            }

        } else {
            let path = []
            for (let i = 0; i < RANDOM_DOWN_DISTANCE; i++) {
                let cId = i * 10;
                // console.log(cId);
                let cell = this.getCellById(cId);
                cell.setColor(`#${bg}`);
                cell.updateStatus(4)
                // console.log(cell);
                path.push(cell);
            }
            for (let i = 0; i < RANDOM_RIGHT_DISTANCE; i++) {
                let cId = path[path.length - 1].id + 1
                // console.log(cId);
                let cell = this.getCellById(cId);
                cell.setColor(`#${bg}`);
                cell.updateStatus(4)
                // console.log(cell);
                path.push(cell);
            }
            let blocksLeftToBottom = 10 - path[path.length - 1].row;
            for (let i = 0; i < blocksLeftToBottom; i++) {
                let cId = path[path.length - 1].id + 10;
                // console.log(cId);
                let cell = this.getCellById(cId);
                cell.setColor(`#${bg}`);
                cell.updateStatus(4)
                // console.log(cell);
                path.push(cell);
            }
            if (path[path.length - 1].id !== 99) {
                let blocksLeftToRight = 10 - path[path.length - 1].col;
                for (let i = 0; i < blocksLeftToRight; i++) {
                    let cId = path[path.length - 1].id + 1;
                    // console.log(cId);
                    let cell = this.getCellById(cId);
                    cell.setColor(`#${bg}`);
                    cell.updateStatus(4)
                    // console.log(cell);
                    path.push(cell);
                }
            }
        }


        this.reverse = !this.reverse;

    }
    getPossibleNextMoves(cell: GridCell) {
        return this.getNeighbors(cell);
    }
    getNeighbors(cell: GridCell) {
        // console.log(cell);
        let neighbors = [];
        // get the neighbors of the cell
        let id = cell.id;
        // get the neighbors of the cell
        let top = this.getCellById(id - 10);
        let bottom = this.getCellById(id + 10);
        let left = this.getCellById(id - 1);
        let right = this.getCellById(id + 1);
        // add the neighbors to the neighbors array
        if (top && !this.checkIfCellIsInArray(cell, this.gridBorders.top)) {
            neighbors[0] = top;
        } else {
            neighbors[0] = 0;
        }
        if (bottom && !this.checkIfCellIsInArray(cell, this.gridBorders.bottom)) {
            neighbors[1] = bottom;
        } else {
            neighbors[1] = 0;

        }
        if (left && !this.checkIfCellIsInArray(cell, this.gridBorders.left)) {
            neighbors[2] = left;
        } else {
            neighbors[2] = 0;
        }
        if (right && !this.checkIfCellIsInArray(cell, this.gridBorders.right)) {
            neighbors[3] = right;
        } else {
            neighbors[3] = 0;

        }
        // return the neighbors
        return neighbors;
    }
    checkIfCellIsInArray(cell: GridCell, array: GridCell[]) {
        let result = array.filter(c => c.id === cell.id);
        return result.length > 0;
    }
    getWalls() {
        return this.grid.filter(cell => cell.status === 0);
    }
    resetPath() {
        this.grid.forEach(cell => {
            if (cell.status === 4) {
                cell.setColor(`#${bg}`);
            }
        })
    }
    public getNumArray() {
        return this.grid.map(cell => cell.status)
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
    return rgbToHex(r, g, b)
}

// function to return a hex color string for a given rgb value
function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

// function to split a 1d array into a 2d array of 10 cells each
function splitGrid(grid) {
    let masterSplit = [];
    // split the grid into 10 arrays of 10 cells each
    for (let i = 0; i < grid.length; i += 1) {
        if (i % 10 === 0) {
            masterSplit.push([]);
        }

        masterSplit[masterSplit.length - 1].push(grid[i]);
    }
    // console.log(masterSplit);
    return masterSplit; // a 2d array of 10 cells each
}