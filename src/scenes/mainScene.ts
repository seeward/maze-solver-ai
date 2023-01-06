import 'phaser';
import { Agent } from '../assets/agent';
import { MainGrid } from '../assets/grid';
import { GridCell } from '../assets/gridCell';
import { MazeSolver } from './brain';

const timer = ms => new Promise(res => setTimeout(res, ms))
const PERCENT_LEARNED = document.getElementById('boardPercentLearned');
const AGENTS_HEALTH = document.getElementById('agentsHealth');
const FAST_MODE = document.getElementById('fastmode');
// console.log((FAST_MODE as any).value);
FAST_MODE.addEventListener('change', (e) => {
    fastMode = (e.target as any).checked;
})
let lineMode = false;
const LINE_MODE = document.getElementById('linemode');
// console.log((FAST_MODE as any).value);
LINE_MODE.addEventListener('change', (e) => {
    lineMode = (e.target as any).checked;
})
const DATA_COUNT = document.getElementById('dataCount');
const PREDICTION = document.getElementById('prediction');
const AI_STATUS = document.getElementById('aiStatus');
const DOWNLOAD_MAP = document.getElementById('dlBoard');
const AI_LOAD = document.getElementById('loadModel');
const MAZE_LOAD = document.getElementById('maze-upload');
const GATHER_DATA = document.getElementById('gather');
const GENERATE_GRID = document.getElementById('generate');
const START = document.getElementById('start');
const AGENTS = document.getElementById('agentcount');
const AGENTSUPDATE = document.getElementById('agents');
const RANGE = document.getElementById('difficulty');
const TEXTUPDATE = document.getElementById('updateDiff');
const EPOCHS = document.getElementById('epochcount');
const EPOCHSUPDATE = document.getElementById('epochsnum');
EPOCHS.addEventListener('change', (e) => {
    EPOCHSUPDATE.innerHTML = (e.target as any).value;
})
let fastMode = false
let mousey;
let _results: any[] = [];
let self;
let agentsDead = 0;


interface MainSceneType extends Phaser.Scene {
    grid: MainGrid;
    intro?: Phaser.GameObjects.Text;
    agents: Agent[];
    agentIdCounter: number;
    numAgents: number;
    handleGameOver: (q: number, moves: number, id: number, win: boolean) => void;
    createAgent: () => Agent;
    startAgents: () => void;
    trainingDataX: any[];
    trainingDataY: any[];
    currentAgent: Agent;
    userAgent: Phaser.GameObjects.Sprite;
    currentColor?: number | undefined; // selected to draw
}

// function to sort a given array of js objects A from lowest to highest index based on a given key 
function sortArray(A, key) {
    A.sort(function (a, b) {
        return a[key] - b[key];
    });
    return A;
}

export default class MainScene extends Phaser.Scene implements MainSceneType {

    grid: MainGrid;
    AI: MazeSolver;
    agents: Agent[];
    aiLoaded: boolean = false;
    trainingDataX: any[] = [];
    trainingDataY: any[] = [];
    agentIdCounter: number = 0;
    numAgents: number;
    ranger: number;
    agentSpeed: string = 'fast';
    gatherData: boolean = false;
    tilesLearned: number[] = [];
    playingMusic: boolean = false;
    introElements: any[] = [];
    currentAgent: Agent;
    userAgent: Agent;
    currentColor: number | undefined; // selected to draw
    traps: Phaser.GameObjects.Sprite[] = [];
    trail: any[] = [];
    prevCell: GridCell;

    constructor() {
        super({ key: 'mainscene' });
        this.agents = [];
        this.trainingDataX = [];
        this.trainingDataY = [];
        this.AI = new MazeSolver();
        this.clearTrainingData();
        self = this;
    }
    createIntro() {
        let flipper = false
        // this.introElements.push(new MainGrid(this, 200, 200, 10, 4))
        this.introElements.push(this.add.rectangle(75, 75, 850, 600, 0xffffff).setDepth(99).setOrigin(0, 0).setAlpha(0.95));
        this.introElements.push(this.add.image(110, 125, 'logo').setDepth(100).setScale(0.2).setOrigin(0));
        // this.introElements.push(this.add.text(125, 125, '🤖', { fontSize: '100px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(300, 125, 'Welcome to Maze Solver AI', { fontSize: '32px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(300, 175, 'This is a simple maze solving AI that uses a neural \nnetwork to learn how to solve a maze.', { fontSize: '16px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(300, 225, 'The AI is trained using a genetic algorithm that \nuses a population of agents to learn how to solve \nthe maze.', { fontSize: '16px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(125, 325, 'Step 1: Generate a Maze of a chosen difficulty.', { fontSize: '18px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(125, 375, 'Step 2: Create some AI agents to learn the maze by gathering data.', { fontSize: '18px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(125, 425, 'Step 3: Train the AI using the gathered data for a number of Epochs.', { fontSize: '18px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(125, 475, 'Step 4: Watch the AI solve the maze on its own.', { fontSize: '18px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(125, 575, 'Pro Tip!', { fontSize: '22px', color: '#FF0000' }).setDepth(100));
        this.introElements.push(this.add.text(110, 610, 'Keep training the AI until the loss is close to 0.', { fontSize: '26px', color: '#000000' }).setDepth(100));
        let spaceX = 120;
        for (let i = 0; i < 10; i++) {

            this.introElements.push(this.add.sprite(spaceX, 540, 'mouse_texture').setDepth(100).setScale(0.5));
            spaceX += 85
        }

    }
    deleteIntro() {
        this.introElements.forEach(e => e.destroy());
    }
    preload() {
        this.load.image('inside', 'insidemouse.jpeg');
        this.load.image('logo', 'logo.webp');
        // this.load.audio('theme', 'PinkyAndTheBrain.mp3');
        this.load.audio('pop', 'shortpop.wav');
        this.load.audio('win', 'winner.wav');
    }
    getAgentSpeed() {
        return this.agentSpeed === 'fast' ? 1000 : 50;
    }
    drawTrail(){
        // this.trail.push(this.scene.add.line(this.agent.x, this.agent.y,this.prevCell.x + 50, this.prevCell.y + 50, this.agent.x, this.agent.y, 0xffffff, 0.5).setDepth(10));

    }
    getDirectionArrow(direction: number) {

        switch (direction) {
            case 0:
                return `<i style="font-size: 50px" class="bi bi-arrow-up-square-fill"></i>`;
            case 1:
                return `<i style="font-size: 50px" class="bi bi-arrow-down-square-fill"></i>`;
            case 2:
                return `<i style="font-size: 50px" class="bi bi-arrow-left-square-fill"></i>`;
            case 3:
                return `<i style="font-size: 50px" class="bi bi-arrow-right-square-fill"></i>`;
        }

    }
    getPercentLearned() {
        return ((this.tilesLearned.length / this.grid.grid.filter(r => r.status === 4).length) * 100).toFixed(2);
    }
    async loadModel() {
        self.deleteIntro();
        
        const jsonUpload = document.getElementById('json-upload');
        const weightsUpload = document.getElementById('weights-upload');

        if (!(jsonUpload as any).files[0] || !(weightsUpload as any).files[0]) {
            return false;
        }

        let relatedMaze = (MAZE_LOAD as any).files[0];
        let hist = JSON.parse(localStorage.getItem('trainedGrid'));
        if (!hist) {

            let reader = new FileReader();
            let _self = this // :)
            reader.onload = (async function (theFile) {


                hist = JSON.parse(theFile.target.result as string);
                self.grid = new MainGrid(_self, 0, 0, 10, _self.ranger, hist);
                await _self.AI.loadModel();

                AI_STATUS.innerHTML = 'AI Model Loaded';
                AI_STATUS.classList.remove('bg-warning');
                AI_STATUS.classList.add('bg-success');
            })

            // Read in the json file as a data URL.
            await reader.readAsText(relatedMaze);

        } else {
            self.grid = new MainGrid(this, 0, 0, 10, this.ranger, hist);
            await this.AI.loadModel();

            AI_STATUS.innerHTML = 'AI Model Loaded';
            AI_STATUS.classList.remove('bg-warning');
            AI_STATUS.classList.add('bg-success');
        }
        let dCheck = DOWNLOAD_MAP.attributes.getNamedItem('disabled');
        if (dCheck) {
            DOWNLOAD_MAP.attributes.removeNamedItem('disabled');
        }
        let d2Check = AI_LOAD.attributes.getNamedItem('disabled');
        if (d2Check) {
            AI_LOAD.attributes.removeNamedItem('disabled');
        }
        let d3Check = GATHER_DATA.attributes.getNamedItem('disabled');
            if (d3Check) {
                GATHER_DATA.attributes.removeNamedItem('disabled');
            }

            let d4Check = START.attributes.getNamedItem('disabled');
            if (d4Check) {
                START.attributes.removeNamedItem('disabled');
            }
        this.clearTrainingData();
        self.aiLoaded = true;
        return true

    }
    async handleMusic() {
        if (!this.playingMusic) {

            // this.sound.play('theme', { loop: true, volume: 0.25 });
            // this.playingMusic = true;
        } else {
            // this.sound.stopAll();
            // this.playingMusic = false;
        }

    }
    clearTrainingData() {
        localStorage.removeItem('trainingDataX');
        localStorage.removeItem('trainingDataY');
    }
    getTrainingDataLength() {

        if (localStorage.getItem('trainingDataX') === null) {
            return 0;
        } else {
            let tdX = JSON.parse(localStorage.getItem('trainingDataX'));
            return tdX ? tdX.length : 0;
        }

    }
    getTrainingData() {
        let tdX = JSON.parse(localStorage.getItem('trainingDataX'));
        let tdY = JSON.parse(localStorage.getItem('trainingDataY'));
        return { X: tdX, y: tdY };
    }
    saveModel() {
        this.AI.saveModel();
    }
    async trainModel() {
        const y4 = document.getElementById('gatheringDataFlag');
                y4.innerHTML = 'Training AI model on gathered data...';
        this.agents.forEach(a => a.destroy());
        if (!this.AI.active) {
            await this.AI.createModel()
        }
        if (localStorage.getItem('trainedGrid') === null) {
            localStorage.setItem('currentGrid', JSON.stringify(this.grid.getNumArray()));
        }
        let tdX = JSON.parse(localStorage.getItem('trainingDataX'));
        let tdY = JSON.parse(localStorage.getItem('trainingDataY'));
        await this.AI.trainModel(tdX, tdY, (EPOCHS as any).value);
        let t = tdX[Math.floor(Math.random() * tdX.length)];
        self.aiLoaded = true;
        this.clearTrainingData();
        AI_STATUS.innerHTML = 'AI Trained';
        AI_STATUS.classList.remove('bg-warning');
        AI_STATUS.classList.add('bg-success');
        localStorage.setItem('trainedGrid', JSON.stringify(this.grid.getNumArray()));
        let dCheck = DOWNLOAD_MAP.attributes.getNamedItem('disabled');
        if (dCheck) {
            DOWNLOAD_MAP.attributes.removeNamedItem('disabled');
        }
        let d2Check = AI_LOAD.attributes.getNamedItem('disabled');
        if (d2Check) {
            AI_LOAD.attributes.removeNamedItem('disabled');
        }
        const y = document.getElementById('gatheringDataFlag');
        y.innerHTML = 'Model Training Complete';
    }
    saveTextAsFile(textToWrite) {
        var textFileAsBlob = new Blob([textToWrite], { type: 'text/json' });
        var downloadLink = document.createElement("a");
        downloadLink.download = 'currentMap.json';
        downloadLink.innerHTML = "map.json";
        if (window.webkitURL != null) {
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        }


        downloadLink.click();
    }
    async handleGameOver(q, moves, id, win) {

        self.grid.resetPath();
        agentsDead++;
        PERCENT_LEARNED.innerHTML = `Percent Visited: ${self.getPercentLearned()}%`;
        _results.push({ id: id, moves: moves + 1, q: q, state: win ? 1 : 0 });
        AGENTS_HEALTH.innerHTML = `Agents: ${self.numAgents - agentsDead} / ${self.numAgents}`;
        // console.log(`alive agents: ${self.agents.length}`)
        // console.log(`agents dead: ${agentsDead}`)
        // console.log(`agents: ${self.agents}`)
        if (self.gatherData) {
            DATA_COUNT.innerHTML = `Data Length: ${self.getTrainingDataLength()}`;
            if(self.getTrainingDataLength() > 20000){
             
                const y = document.getElementById('gatheringDataFlag');
                y.innerHTML = 'Gathering Data Complete';
                self.agents.forEach(a => a.destroy());
                self.agents = [];
                self.trainModel();
            }

            if (localStorage.getItem('trainingDataX') === null && localStorage.getItem('trainingDataY') === null) {
                localStorage.setItem('trainingDataX', JSON.stringify(self.trainingDataX));
                localStorage.setItem('trainingDataY', JSON.stringify(self.trainingDataY));
            } else {

                if (self.getTrainingDataLength() < 20000) {
                    let tdX = JSON.parse(localStorage.getItem('trainingDataX'));
                    let tdY = JSON.parse(localStorage.getItem('trainingDataY'));
                    tdX = tdX.concat(self.trainingDataX);
                    tdY = tdY.concat(self.trainingDataY);
                    localStorage.setItem('trainingDataX', JSON.stringify(tdX));
                    localStorage.setItem('trainingDataY', JSON.stringify(tdY));
                }

            }
        } else if (win) {
            document.getElementById(`winner`).innerHTML = `🕵🏻‍♀️ ${id} made it to the 🧀!`
        }

    }
    createAgent() {
        self.agentIdCounter++;
        return new Agent(self, 20, 30, 0xffffff, self.handleGameOver, self.agentIdCounter);
    }
    ///////////////////////
    // the main Agent loop is in here
    ////////////////////////////////////
    async startAgents() {
        agentsDead = 0;
        await timer(1000);
        if (self.agents.length === 0) {
            return;
        }
        // get the first agent in the array
        this.currentAgent = self.agents[0] as Agent;
        if(this.currentAgent){
            console.log('current agent before set current cell')
            this.currentAgent.setCurrentCell(self.grid.grid.filter(r => r.status === 4 && r.id !== 99)[Math.floor(Math.random() * self.grid.grid.length)] || self.grid.grid[0]);
            console.log('current agent after set current cell')
            if(this.currentAgent.currentCell === undefined){
                this.currentAgent.currentCell = self.grid.grid[0];
                this.currentAgent.currentCell.setColor(0x212121)
            } else {
                this.currentAgent.currentCell.setColor(0x212121)
            }
            
        } else {
            console.log('no current agent')
        }

        // draw the agent texture
        this.currentAgent.draw();
        let nextMoves: GridCell[] = []; // for the next possible moves
        let nextMove: GridCell = undefined; // for the actual next move

        while (this.agents.length > 0) {


            if (!this.currentAgent.alive) {
                this.agents.shift();
                if (this.agents.length === 0) {
                    if (self.gatherData) {
                        // console.log('no more agents');
                        self.trainModel();
                        const y2 = document.getElementById('gatheringDataFlag');
                        y2.innerHTML = 'Training AI model...';
                        agentsDead = 0;
                    }
                    break;
                } else {
                    
                    this.currentAgent = self.agents[0] as Agent;
                    if(this.currentAgent){
                        console.log('current agent before set current cell 2')
                        this.currentAgent.setCurrentCell(self.grid.grid.filter(r => r.status === 4 && r.id !== 99)[Math.floor(Math.random() * self.grid.grid.length)]);
                        console.log('current agent after set current cell 2')
                        this.currentAgent.draw();
                    } else {
                        break;
                    }
                    
                }

            }
            // we have a trained / loaded model and not gathering data
            // AI is predicting the next move
            if (self.aiLoaded && !self.gatherData) {
                if( this.currentAgent.getCurrentCell() === null){
                    this.currentAgent.setCurrentCell(self.grid.grid.filter(r => r.status === 4 && r.id !== 99)[Math.floor(Math.random() * self.grid.grid.length)] || self.grid.grid[0]);
                }
                // get a flat 1D array of the grid
                let ea = self.grid.getNumArray()
                // set the target cell status - will be for moving targets in future?
                ea[99] = 99;
                // set the current agent position with a status 3
                ea[this.currentAgent.getCurrentCell().id] = 3;
                // get the possible next moves
                let possNextMoves = self.grid.getPossibleNextMoves(this.currentAgent.getCurrentCell());
                // let the AI predict the next move from just the maze state
                let nextMove = await self.AI.predict([ea]); // returns a 1D array of the next move
                // get the index of the highest value in the array
                let hightest = self.getDirection(nextMove);
                PREDICTION.innerHTML = self.getDirectionArrow(hightest);
                // try to move to the nextMove which will add reward to the agent
                if (this.currentAgent.move(possNextMoves[hightest])) {
                    // pause for 1 second
                    self.prevCell = this.currentAgent.getCurrentCell();
                    await timer(750);
                }

            } else {
                // we are gathering data or we have no trained model

                // set to cell [0] if the current cell did not get set - TODO - fix this
                if (!this.currentAgent.getCurrentCell()) {
                    this.currentAgent.setCurrentCell(self.grid.grid[0]);
                }

                // define an array of possible next moves
                let options = self.grid.getPossibleNextMoves(this.currentAgent.getCurrentCell()).filter(r => typeof r !== 'number')
                // choose a random move from the array of possible next moves
                nextMove = options[Math.floor(Math.random() * options.length)];
                // if the next move is in the agents history then remove it from the array

                // this reduces the chance of the agent getting stuck in a loop
                // by removing the already visited cell from the array of possible next moves
                if (this.currentAgent.history.indexOf(nextMove.id) > -1) {
                    options = options.filter(r => r.id !== nextMove.id);
                    nextMove = options[Math.floor(Math.random() * options.length)];
                }

                // try to move to the nextMove which will add reward to the agent
                if (this.currentAgent.move(nextMove)) {
                    // the agent survived and has the last cell reward
                    self.prevCell = nextMove
                    

                    if (self.tilesLearned.indexOf(nextMove.id) === -1) {
                        self.tilesLearned.push(nextMove.id);
                        // console.log(self.tilesLearned.length);
                    }
                    if(self.prevCell !== undefined && self.currentAgent.history.length >=3 && lineMode){
                        // console.log(self.currentAgent.history);
                        self.trail.push(this.add.line(0,0,self.prevCell.x + 50 ,self.prevCell.y + 50 ,self.grid.getCellById(self.currentAgent.history[self.currentAgent.history.length -2]).x + 50, self.grid.getCellById(self.currentAgent.history[self.currentAgent.history.length -2]).y + 50,0xc1c1c1,0.25).setOrigin(0));
                    }
                    // get the possible next moves for the agent to train the NN
                    // this will be GridCells if a possible move or a number if not
                    nextMoves = self.grid.getPossibleNextMoves(this.currentAgent.getCurrentCell())
                    // make a copy of the nextMoves array
                    let setForQ = nextMoves;
                    // filter out the numbers from the array so only GridCells remain
                    nextMoves = nextMoves.filter(r => typeof r !== 'number');
                    let futureQSet = [];
                    // below creates [up,down.left,right] Q values for the current cell
                    for (let i = 0; i < setForQ.length; i++) {
                        // if the next move is a GridCell then get the reward
                        if (typeof setForQ[i] !== 'number') {
                            futureQSet[i] = setForQ[i].getReward();
                        } else {
                            // if the next move is a number then set the Q value to 0
                            futureQSet[i] = 0;
                        }
                    }
                    // get a flat 1D array of the grid state to train the NN
                    let ea = self.grid.getNumArray()
                    // set the target cell status - will be for moving targets in future
                    ea[99] = 99
                    // set the current agent position with a status 3
                    ea[this.currentAgent.getCurrentCell().id] = 3;
                    // add the current grid state to the training data
                    self.trainingDataX.push(ea);
                    // add the Q values for the current cell to the training data
                    self.trainingDataY.push(futureQSet);
                    // set the color to white to leave a trail of visited cells
                    nextMove.setColor(0x212121);
                    // pause for 50 ms if gathering data or 1 second if not
                    await timer(fastMode ? 100 : 750);
                } else {
                    await timer(fastMode ? 100 : 750);
                }
            }

        }
    }
    createGrid() {
        if (!self.grid) {
            self.grid = new MainGrid(this, 0, 0, 10, this.ranger);
        } else {
            self.traps.forEach(r=>r.destroy());
            self.grid.destroy();
            self.grid = new MainGrid(this, 0, 0, 10, this.ranger);
        }
        let target = self.grid.getNumArray()
        target[99] = 99;
        target[0] = 3;
        localStorage.setItem('currentGrid', JSON.stringify(target));

        self.grid.grid.forEach((eachOne)=>{
            if(eachOne.status === 0){
                this.traps.push(this.add.sprite(eachOne.x, eachOne.y, `trap`).setOrigin(0).setDepth(120).setScale(1.04).play('pulse'))
            }
        })
            
    }
    createTextures() {

        let tap = ".............33333..............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,.............80008..............,3...........8880888............3,30000000000008000800000000000003,33030303030300080000303030303033,30000000000008000800000000000003,3...........8880888............3,.............80008..............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,.............33333..............";
        let tap2 = tap.split(",")
        this.textures.generate(`trap`, {
            data: tap2,
            pixelWidth: 3
        });

        let tap_1 = ".............33333..............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............080...............,.............80008..............,3...........8880888............3,30000000000008000800000000000003,33030303030800030000803030303033,30000000000008000800000000000003,3...........8880888............3,.............80008..............,..............000...............,..............080...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,.............33333..............";
        let tap_2 = ".............33333..............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............080...............,..............000...............,..............030...............,.............80008..............,3...........8880888............3,30000000000008000800000000000003,33030303080300080000308030303033,30000000000008000800000000000003,3...........8880888............3,.............80008..............,..............000...............,..............030...............,..............000...............,..............080...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,.............33333..............";
        let tap_3 = ".............33333..............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............080...............,..............000...............,..............030...............,..............000...............,..............030...............,.............80008..............,3...........8880888............3,30000000000008000800000000000003,33030308030300030000303080303033,30000000000008000800000000000003,3...........8880888............3,.............80008..............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............080...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,.............33333..............";
        let tap_4 = ".............33333..............,..............030...............,..............000...............,..............030...............,..............000...............,..............080...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,.............80008..............,3...........8880888............3,30000000000008000800000000000003,33030803030300080000303030803033,30000000000008000800000000000003,3...........8880888............3,.............80008..............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............080...............,..............000...............,..............030...............,..............000...............,..............030...............,.............33333..............";
        let tap_5 = ".............33333..............,..............030...............,..............000...............,..............080...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,.............80008..............,3...........8880888............3,30000000000008000800000000000003,33080303030300030000303030308033,30000000000008000800000000000003,3...........8880888............3,.............80008..............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............080...............,..............000...............,..............030...............,.............33333..............";
        let tap_6 = ".............33833..............,..............080...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,.............80008..............,3...........8880888............3,30000000000008000800000000000003,88030303030300080000303030303088,30000000000008000800000000000003,3...........8880888............3,.............80008..............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............080...............,.............33833..............";
        let tap_7 = ".............88888..............,..............080...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,.............80008..............,8...........8380838............8,80000000000008000800000000000008,88030303030300030000303030303088,80000000000008000800000000000008,8...........8380838............8,.............80008..............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............080...............,.............88888..............";
        let tap_8 = ".............33333..............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,.............80008..............,3...........8880888............3,30000000000008000800000000000003,33030303030300080000303030303033,30000000000008000800000000000003,3...........8880888............3,.............80008..............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,..............000...............,..............030...............,.............33333..............";

        let tap_1_1 = tap_1.split(",")
        this.textures.generate(`trap_01`, {
            data: tap_1_1,
            pixelWidth: 3
        });
        let tap_1_2 = tap_2.split(",")
        this.textures.generate(`trap_02`, {
            data: tap_1_2,
            pixelWidth: 3
        });
        let tap_1_3 = tap_3.split(",")
        this.textures.generate(`trap_03`, {
            data: tap_1_3,
            pixelWidth: 3
        });
        let tap_1_4 = tap_4.split(",")
        this.textures.generate(`trap_04`, {
            data: tap_1_4,
            pixelWidth: 3
        });
        let tap_1_5 = tap_5.split(",")
        this.textures.generate(`trap_05`, {
            data: tap_1_5,
            pixelWidth: 3
        });
        let tap_1_6 = tap_6.split(",")
        this.textures.generate(`trap_06`, {
            data: tap_1_6,
            pixelWidth: 3
        });
        let tap_1_7 = tap_7.split(",")
        this.textures.generate(`trap_07`, {
            data: tap_1_7,
            pixelWidth: 3
        });
        let tap_1_8 = tap_8.split(",")
        this.textures.generate(`trap_08`, {
            data: tap_1_8,
            pixelWidth: 3
        });
        this.anims.create({
            key: `pulse`,
            frames: [
                { key: `trap_01`, frame: `trap_01` },
                { key: `trap_02`, frame: `trap_02` },
                { key: `trap_03`, frame: `trap_03` },
                { key: `trap_04`, frame: `trap_04` },
                { key: `trap_05`, frame: `trap_05` },
                { key: `trap_06`, frame: `trap_06` },
                { key: `trap_07`, frame: `trap_07` },
                { key: `trap_08`, frame: `trap_08` }
            ],
            frameRate: 16,
            repeat: -1
        });



        let bar = [
            ".11.11..",
            "1441441.",
            "1411141.",
            ".11111..",
            ".10101..",
            ".11211..",
            "111111.4",
            "11111144"
        ]

        self.textures.generate(`mouse_texture`, {
            data: bar,
            pixelWidth: 8
        });


        let frame_3 = [
            ".11.11..",
            "1441441.",
            "1441441.",
            ".11111..",
            ".10101..",
            ".11211..",
            "111111.4",
            "10111144"
        ];
        let frame_4 = [
            ".11.11..",
            "1441441.",
            "1441441.",
            ".11111..",
            ".10101..",
            ".11211..",
            "111111.4",
            "11110144"
        ];

        this.textures.generate(`walk_ani3`, {
            data: frame_3,
            pixelWidth: 8
        });
        this.textures.generate(`walk_ani4`, {
            data: frame_4,
            pixelWidth: 8
        });
        // create a phaser animation from the frames
        this.anims.create({
            key: `walk`,
            frames: [
                { key: `walk_ani3`, frame: `walk_ani03` },
                { key: `walk_ani4`, frame: `walk_ani04` }
            ],
            frameRate: 2,
            repeat: -1
        });


        // mouse eating the cheese

        let open_0 = [
            ".11.11..",
            "1441441.",
            "1441441.",
            ".11111..",
            ".10101..",
            ".11211..",
            "111111.4",
            "11111144"
        ]


 
        let open_3  = [
            ".11.11..",
            "1122111.",
            "100001..",
            "100001..",
            "100001..",
            "100001..",
            "102201.4",
            "11111144"
        ];

       

        let open_4 = [
            ".11.11..",
            "1441441.",
            "1441441.",
            ".11111..",
            ".10101..",
            ".11211..",
            "111111.4",
            "11111144"
        ];

        this.textures.generate(`eat_ani0`, {
            data: open_0,
            pixelWidth: 8
        });

        
        this.textures.generate(`eat_ani3`, {
            data: open_3,
            pixelWidth: 8
        });

        this.textures.generate(`eat_ani4`, {
            data: open_4,
            pixelWidth: 8
        });


        // create a phaser animation from the frames
        this.anims.create({
            key: `eat`,
            frames: [
                { key: `eat_ani0`, frame: `eat_ani00` },
                { key: `eat_ani3`, frame: `eat_ani03` },
                { key: `eat_ani4`, frame: `eat_ani04` }
                
            ],
            frameRate: 3,
            repeat: 1
        });




        let ran = Math.floor(Math.random() * 2000);
        let ex = [
            "........",
            "........",
            "........",
            "....8...",
            "...82...",
            "........",
            "........",
            "........"
        ]

        let ex_1 = [
            "........",
            "........",
            "........",
            "....8...",
            "...22...",
            "....3...",
            "........",
            "........"
        ];
        let ex_2 = [
            "........",
            ".....8..",
            "...888..",
            "...22...",
            "...33...",
            "..8..8..",
            ".8...8..",
            "........"
        ];
        let ex_3 = [
            "......3.",
            ".3...83.",
            "...888..",
            ".333333.",
            ".333333.",
            "..2338..",
            ".73..7..",
            "7......."
        ];
        let ex_4 = [
            "......2.",
            ".2...23.",
            ".2.333..",
            "322..33.",
            "322..33.",
            "..2..83.",
            ".2...73.",
            "......3."
        ];
        let ex_5 = [
            "......2.",
            ".2...23.",
            ".2.333..",
            "322..33.",
            "322..33.",
            "..2..83.",
            ".2...73.",
            "......3."
        ];
        let ex_6 = [
            ".......3",
            ".....2..",
            "........",
            "3.......",
            "........",
            "........",
            "....7...",
            ".2......"
        ];

        this.textures.generate(`explode_ani1`, {
            data: ex_1,
            pixelWidth: 10
        });
        this.textures.generate(`explode_ani2`, {
            data: ex_2,
            pixelWidth: 10
        });
        this.textures.generate(`explode_ani3`, {
            data: ex_3,
            pixelWidth: 10
        });
        this.textures.generate(`explode_ani4`, {
            data: ex_4,
            pixelWidth: 10
        });
        this.textures.generate(`explode_ani5`, {
            data: ex_5,
            pixelWidth: 10
        });
        this.textures.generate(`explode_ani6`, {
            data: ex_6,
            pixelWidth: 10
        });


        // create a phaser animation from the frames
        this.anims.create({
            key: `explode`,
            frames: [
                { key: `explode_ani1`, frame: `${ran}_ani01` },
                { key: `explode_ani2`, frame: `${ran}_ani02` },
                { key: `explode_ani3`, frame: `${ran}_ani03` },
                { key: `explode_ani4`, frame: `${ran}_ani04` },
                { key: `explode_ani5`, frame: `${ran}_ani05` },
                { key: `explode_ani6`, frame: `${ran}_ani06` }

            ],
            frameRate: 8,
            repeat: 0
        });

        this.textures.generate(`explosion`, {
            data: ex,
            pixelWidth: 8
        });

    }
    create() {
        self.createTextures();
        this.createIntro();
        // self.userAgent = this.add.sprite(50, 50, 'mouse_texture').setDepth(150).play('eat')

        document.getElementById('music').addEventListener('click', (e) => {
            this.handleMusic();
        })
        AI_LOAD.addEventListener('click', async (e) => {
            let msg = await self.loadModel();
            // console.log(`result from loading model: ${msg}`);
            if (!msg) {
                const y = document.getElementById('gatheringDataFlag');
                y.classList.remove('bg-warning');
                y.innerHTML = 'Both Model and Weights need to be selected...';
            }
        });

        DOWNLOAD_MAP.addEventListener('click', (e) => {
            let map = localStorage.getItem('currentGrid');
            self.saveTextAsFile(map)
            self.saveModel();
        })

        GATHER_DATA.addEventListener('click', (e) => {
            self.gatherData = !self.gatherData
            const header = document.getElementById('headerbar');
            header.style.backgroundColor = self.gatherData ? '#f79e9e' : '#CEF4FC';
            const y = document.getElementById('gatheringDataFlag');
            if (self.gatherData) {
                y.classList.remove('bg-warning');
                y.innerHTML = 'Gathering Data';

            } else {
                y.classList.add('bg-warning');
                y.innerHTML = ``;
            }
            this.clearTrainingData();
        });

        GENERATE_GRID.addEventListener('click', (e) => {
            this.deleteIntro();
            // document.getElementById('difficulty').style.display = 'none';
            this.createGrid();
            GENERATE_GRID.attributes.setNamedItem(document.createAttribute('disabled'));


            let d2Check = GATHER_DATA.attributes.getNamedItem('disabled');
            if (d2Check) {
                GATHER_DATA.attributes.removeNamedItem('disabled');
            }

            let dCheck = START.attributes.getNamedItem('disabled');
            if (dCheck) {
                START.attributes.removeNamedItem('disabled');
            }
        });

        START.addEventListener('click', async (e) => {
            if (!this.playingMusic) {
                // this.sound.play('theme', { loop: true, volume: 0.25 });
                // this.playingMusic = true;
            }

            this.createAgents();
            self.startAgents();
        });

        AGENTS.addEventListener('change', (e) => {
            self.numAgents = parseInt((<HTMLInputElement>e.target).value);
            AGENTSUPDATE.innerHTML = `${self.numAgents}`;

        });

        RANGE.addEventListener('change', (e) => {
            this.ranger = parseInt((<HTMLInputElement>e.target).value);
            // console.log(this.ranger);
            TEXTUPDATE.innerHTML = `${this.ranger}`;
            let d2Check = GENERATE_GRID.attributes.getNamedItem('disabled');
            if (d2Check) {
                GENERATE_GRID.attributes.removeNamedItem('disabled');
            }
        });

        this.input.keyboard.on('keydown', (pointer) => {
            if(pointer.preventDefault){
                pointer.preventDefault()
            }
            if(self.userAgent){
                switch (pointer.key) {
                    case 'ArrowRight':
                        this.userAgent.x += 50
                        break;
                    
                    case 'ArrowLeft':
                        this.userAgent.x -= 50
                        break;
                    case 'ArrowUp':
                        this.userAgent.y -= 50
                        break;
                    case 'ArrowDown':
                        this.userAgent.y += 50
                        break;
                }
            }
            
        })
    }
    // function to return the hightest value in an array
    getMaxOfArray(numArray) {
        return Math.max.apply(null, numArray);
    }
    // function to return the index of the highest value in an array
    getDirection(numArray) {
        let max = this.getMaxOfArray(numArray);
        return numArray.indexOf(max);
    }
    createAgents() {
        if(self.agents.length > 0){
            self.agents.forEach(a=>a.destroy());
        }
        while (self.agents.length < self.numAgents) {
            let a = self.createAgent();
            a.setCurrentCell(self.grid.grid.filter(r => r.status === 4)[Math.floor(Math.random() * self.grid.grid.length)]);
            self.agents.push(a);
        }
    }
    update(time: number, delta: number): void {

        if (this.grid) {
            this.grid.update();
        }

    }
}