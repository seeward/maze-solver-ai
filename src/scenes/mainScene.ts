import 'phaser';
import { Agent } from '../assets/agent';
import { MainGrid } from '../assets/grid';
import { GridCell } from '../assets/gridCell';
import { MazeSolver } from './brain';

const timer = ms => new Promise(res => setTimeout(res, ms))
const PERCENT_LEARNED = document.getElementById('boardPercentLearned');
const AGENTS_HEALTH = document.getElementById('agentsHealth');
const FAST_MODE = document.getElementById('fastmode');
console.log((FAST_MODE as any).value);
FAST_MODE.addEventListener('change', (e) => {
    fastMode = (e.target as any).checked;
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
    numAgents: number = 10;
    ranger: number;
    agentSpeed: string = 'fast';
    gatherData: boolean = false;
    tilesLearned: number[] = [];
    playingMusic: boolean = false;
    introElements: any[] = [];

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
        this.introElements.push(new MainGrid(this,200,200,10, 4))
        this.introElements.push(this.add.rectangle(75, 75, 850, 600, 0xffffff).setDepth(99).setOrigin(0, 0).setAlpha(0.95));
        this.introElements.push(this.add.text(125, 125, '🤖', { fontSize: '100px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(275,  125, 'Welcome to Maze Solver AI', { fontSize: '32px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(275,  175, 'This is a simple maze solving AI that uses a neural \nnetwork to learn how to solve a maze.', { fontSize: '16px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(275,  225, 'The AI is trained using a genetic algorithm that \nuses a population of agents to learn how to solve \nthe maze.', { fontSize: '16px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(125,  325, 'Step 1: Generate a Maze of a chosen difficulty.', { fontSize: '18px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(125,  375, 'Step 2: Create some AI agents to learn the maze by gathering data.', { fontSize: '18px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(125,  425, 'Step 3: Train the AI using the gathered data for a number of Epochs.', { fontSize: '18px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(125,  475, 'Step 4: Watch the AI solve the maze on its own.', { fontSize: '18px', color: '#000000' }).setDepth(100));
        this.introElements.push(this.add.text(125,  575, 'Pro Tip!', { fontSize: '22px', color: '#FF0000' }).setDepth(100));
        this.introElements.push(this.add.text(110,  610, 'Keep training the AI until the loss is close to 0.', { fontSize: '26px', color: '#000000' }).setDepth(100));
        self.createTextures();
        let spaceX = 120;
        for(let i = 0;i < 10;i++){

            this.introElements.push(this.add.sprite(spaceX, 540, 'mouse_texture').setDepth(100).setScale(0.5));
            spaceX += 85
        }
        
    }   
    deleteIntro() {
        this.introElements.forEach(e => e.destroy());
    }
    preload() {
        this.load.image('inside', 'insidemouse.jpeg');
        this.load.audio('theme', 'PinkyAndTheBrain.mp3');
        this.load.audio('pop', 'shortpop.wav');
        this.load.audio('win', 'winner.wav');
    }
    getAgentSpeed() {
        return this.agentSpeed === 'fast' ? 1000 : 50;
    }
    getDirectionArrow(direction: number){

        switch(direction){
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
        return ((this.tilesLearned.length / this.grid.grid.filter(r=>r.status === 4).length) * 100).toFixed(2);
    }
    async loadModel() {
        const jsonUpload = document.getElementById('json-upload');
        const weightsUpload = document.getElementById('weights-upload');

        if(!(jsonUpload as any).files[0]  || !(weightsUpload as any).files[0]){
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
        if(dCheck){
            DOWNLOAD_MAP.attributes.removeNamedItem('disabled');
        }
        let d2Check = AI_LOAD.attributes.getNamedItem('disabled');
        if(d2Check){
            AI_LOAD.attributes.removeNamedItem('disabled');
        }

        this.clearTrainingData();
        self.aiLoaded = true;
        return true

    }
    async handleMusic(){
        if(!this.playingMusic){
            
            this.sound.play('theme', { loop: true, volume: 0.25 });
            this.playingMusic = true;
        } else {
            this.sound.stopAll();
            this.playingMusic = false;
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
        if(dCheck){
            DOWNLOAD_MAP.attributes.removeNamedItem('disabled');
        }
        let d2Check = AI_LOAD.attributes.getNamedItem('disabled');
        if(d2Check){
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
       
        if(win){
            document.getElementById(`winner`).innerHTML = `🕵🏻‍♀️ ${id} made it to the 🧀!`
        }
        if (_results.length === self.numAgents) {
            console.log('all agents done');
            console.log(self.agents.length);
            self.agents.forEach(a => a.destroy());
            let sortedArr = sortArray(_results, 'q');
            document.getElementById(`winner`).innerHTML = `W:${sortedArr[0].id} M:${sortedArr[0].moves} Q:${sortedArr[0].q}`;
            _results.slice(0,_results.length - 1);
        }
        PERCENT_LEARNED.innerHTML = `Percent Visited: ${self.getPercentLearned()}%`;
        _results.push({ id: id, moves: moves + 1, q: q, state: win ? 1 : 0 });

        AGENTS_HEALTH.innerHTML = `Agents: ${self.agents.length - 1} / ${self.numAgents}`;
        if (self.gatherData) {
            DATA_COUNT.innerHTML = `Data Length: ${self.getTrainingDataLength()}`;

            
            if (localStorage.getItem('trainingDataX') === null && localStorage.getItem('trainingDataY') === null) {
                localStorage.setItem('trainingDataX', JSON.stringify(self.trainingDataX));
                localStorage.setItem('trainingDataY', JSON.stringify(self.trainingDataY));
            } else {

                if(self.getTrainingDataLength() < 20000){
                    let tdX = JSON.parse(localStorage.getItem('trainingDataX'));
                    let tdY = JSON.parse(localStorage.getItem('trainingDataY'));
                    tdX = tdX.concat(self.trainingDataX);
                    tdY = tdY.concat(self.trainingDataY);
                    localStorage.setItem('trainingDataX', JSON.stringify(tdX));
                    localStorage.setItem('trainingDataY', JSON.stringify(tdY));
                }
                
            }
        }
        
       
    }
    createAgent() {
        self.agentIdCounter++;
        return new Agent(self, 20, 30, 0xffffff, self.handleGameOver, self.agentIdCounter);
    }
    ///////////////////////
    // the main gent loop is in here
    ////////////////////////////////////
    async startAgents() {
        // get the first agent in the array
        let agent = self.agents[0] as Agent
        // set agent on a random open cell - status 4
        agent.setCurrentCell(self.grid.grid.filter(r => r.status === 4)[Math.floor(Math.random() * self.grid.grid.length)]);
        // draw the agent texture
        agent.draw();

        let nextMoves: GridCell[] = []; // for the next possible moves
        let nextMove: GridCell = undefined; // for the actual next move

        while (self.agents.length > 0) {
            // handle agent death
            if (!agent.alive) {
                console.log(`Agent ${agent.id} is dead in the while() loop.`);
                this.grid.resetPath();
                this.agents.shift(); // remove the agent from the array
                if (this.agents.length !== 0) {
                    this.startAgents();
                } else {
                    // console.log('no more agents');
                    // console.log(self.agents.length);
                    if (self.gatherData) {
                        // console.log('no more agents');
                        self.trainModel();
                        const y = document.getElementById('gatheringDataFlag');
                        y.innerHTML = 'Training AI model...';
                    }
                }
                break;
            }

            // we have a trained / loaded model and not gathering data
            // AI is predicting the next move
            if (self.aiLoaded && !self.gatherData) {
                // get a flat 1D array of the grid
                let ea = self.grid.getNumArray()
                // set the target cell status - will be for moving targets in future?
                ea[99] = 99
                // set the current agent position with a status 3
                ea[agent.getCurrentCell().id] = 3;
                // get the possible next moves
                let possNextMoves = self.grid.getPossibleNextMoves(agent.getCurrentCell());
                // let the AI predict the next move from just the maze state
                let nextMove = await self.AI.predict([ea]); // returns a 1D array of the next move
                // get the index of the highest value in the array
                let hightest = self.getDirection(nextMove);
                PREDICTION.innerHTML = self.getDirectionArrow(hightest);
                // try to move to the nextMove which will add reward to the agent
                if (agent.move(possNextMoves[hightest])) {
                    // pause for 1 second
                    await timer(500);
                }

            } else {
                // we are gathering data or we have no trained model
                
                // set to cell [0] if the current cell did not get set - TODO - fix this
                if(!agent.getCurrentCell()){
                    agent.setCurrentCell(self.grid.grid[0]);
                }

                // define an array of possible next moves
                let options = self.grid.getPossibleNextMoves(agent.getCurrentCell()).filter(r => typeof r !== 'number')
                // choose a random move from the array of possible next moves
                nextMove = options[Math.floor(Math.random() * options.length)];
                // if the next move is in the agents history then remove it from the array

                // this reduces the chance of the agent getting stuck in a loop
                // by removing the already visited cell from the array of possible next moves
                if (agent.history.indexOf(nextMove.id) > -1) {
                    options = options.filter(r => r.id !== nextMove.id);
                    nextMove = options[Math.floor(Math.random() * options.length)];
                }

                // try to move to the nextMove which will add reward to the agent
                if (agent.move(nextMove)) {
                    
                    if(self.tilesLearned.indexOf(nextMove.id) === -1){
                        self.tilesLearned.push(nextMove.id);
                        // console.log(self.tilesLearned.length);
                    }
                    // get the possible next moves for the agent to train the NN
                    // this will be GridCells if a possible move or a number if not
                    nextMoves = self.grid.getPossibleNextMoves(agent.getCurrentCell())
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
                    ea[agent.getCurrentCell().id] = 3;
                    // add the current grid state to the training data
                    self.trainingDataX.push(ea);
                    // add the Q values for the current cell to the training data
                    self.trainingDataY.push(futureQSet);
                    // set the color to white to leave a trail of visited cells
                    nextMove.setColor(0x646464);
                    // pause for 50 ms if gathering data or 1 second if not
                    await timer(fastMode ? 100 : 700);

                } else {
                    console.log(`agent died: ${self.agents.length}`);
                }
            }

        }
    }
    createGrid() {
        if (!self.grid) {
            self.grid = new MainGrid(this, 0, 0, 10, this.ranger);
        } else {
            self.grid.destroy();
            self.grid = new MainGrid(this, 0, 0, 10, this.ranger);
        }
        let target = self.grid.getNumArray()
        target[99] = 99;
        target[0] = 3;
        localStorage.setItem('currentGrid', JSON.stringify(target));
    }
    createTextures(){
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
                data : bar,
                pixelWidth : 8
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
            data : frame_3,
            pixelWidth : 8
        });
        this.textures.generate(`walk_ani4`, {
            data : frame_4,
            pixelWidth : 8
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
            data : ex_1,
            pixelWidth : 10
        });
        this.textures.generate(`explode_ani2`, {
            data : ex_2,
            pixelWidth : 10
        });
        this.textures.generate(`explode_ani3`, {
            data : ex_3,
            pixelWidth : 10
        });
        this.textures.generate(`explode_ani4`, {
            data : ex_4,
            pixelWidth : 10
        });
        this.textures.generate(`explode_ani5`, {
            data : ex_5,
            pixelWidth : 10
        });
        this.textures.generate(`explode_ani6`, {
            data : ex_6,
            pixelWidth : 10
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
            frameRate: 6,
            repeat: 0
        });

        this.textures.generate(`explosion`, {
            data : ex,
            pixelWidth : 8
        });

    }
    create() {

        this.createIntro();
        // this.createTextures();
        document.getElementById('music').addEventListener('click', (e) => {
            this.handleMusic();
        })
        AI_LOAD.addEventListener('click', async (e) => {
            let msg = await self.loadModel();
            console.log(`result from loading model: ${msg}`);
            if(!msg){
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
            if(self.gatherData){
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
        if(d2Check){
            GATHER_DATA.attributes.removeNamedItem('disabled');
        }

        let dCheck = START.attributes.getNamedItem('disabled');
        if(dCheck){
            START.attributes.removeNamedItem('disabled');
        }
        });

        START.addEventListener('click', async (e) => {
            if(!this.playingMusic){
                this.sound.play('theme', { loop: true, volume: 0.25 });
                this.playingMusic = true;
            }
            
            this.createAgents();
            self.startAgents();
        });

        AGENTS.addEventListener('change', (e) => {
            this.numAgents = parseInt((<HTMLInputElement>e.target).value);
            AGENTSUPDATE.innerHTML = `${this.numAgents}`;
            
        });

        RANGE.addEventListener('change', (e) => {
            this.ranger = parseInt((<HTMLInputElement>e.target).value);
            console.log(this.ranger);
            TEXTUPDATE.innerHTML = `${this.ranger}`;
            let d2Check = GENERATE_GRID.attributes.getNamedItem('disabled');
            if(d2Check){
                GENERATE_GRID.attributes.removeNamedItem('disabled');
            }
        });

        // this.input.keyboard.on('keydown', (pointer) => {


        //     switch (pointer.key) {
        //         case 'ArrowRight':
        //             // this.agents[0].move(this.grid.getCellById(this.agents[0].getCurrentCell().id + 1));
        //             break;
        //         case 'ArrowLeft':
        //             // this.createGrid();
        //             break;
        //         case 'ArrowUp':
        //             // this.startAgents();
        //             // this.agents[0].move(this.grid.getCellById(this.agents[0].getCurrentCell().id - 10));
        //             break;
        //         case 'ArrowDown':
        //             // this.startAgents();
        //             // this.agents[0].move(this.grid.getCellById(this.agents[0].getCurrentCell().id + 10));
        //             break;
        //     }
        // })
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