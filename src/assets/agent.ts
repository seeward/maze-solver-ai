import { GridCell } from "./gridCell";
const timer = ms => new Promise(res => setTimeout(res, ms))


export interface AgentHistory {
    id: number;
    q: number;
    cell: GridCell;
}

export class Agent extends Phaser.GameObjects.Sprite {

    scene: Phaser.Scene;
    score: number = 0;
    x: number;
    y: number;
    color: number;
    agent: Phaser.GameObjects.Sprite;
    currentCell: GridCell;
    alive: boolean = true;
    endingQ: number = 0;
    cb: Function;
    id: number;
    moves: number = 0;
    qHistory: AgentHistory[] = [];
    history: any[] = [];



    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, color: number = 0xffffff, cb: Function, id: number) {
        super(scene, x, y, 'agent');
        this.id = id;
        // console.log(`Agent ${this.id} created`);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.color = color;
        this.cb = cb;
        this.currentCell = null;
        // this.draw();
    }
    draw() {
        if(this.scene){
            // this.makeTexture();
            this.agent = this.scene.add.sprite(this.x, this.y, `mouse_texture`).setOrigin(0).setDepth(15).play(`walk`)
            
            // this.agent.anims.play(`walk`);
        }
        
    }

    getHistory(){
        return this.history;
    }
    getCurrentCell() {
        return this.currentCell;
    }

    async setCurrentCell(cell) {
    
        if(!cell){
            return;
        }
        this.qHistory.push({
            id: cell.id,
            q: cell.getQ(),
            cell: cell
        });

        this.history.push(cell.id);

        if(this.history.length > 50){
            this.alive = false;
            this.endingQ = cell.getQ();
            // console.log(`Agent ${this.id} from too many moves: ${this.history.length}`);
            this.cb(cell.getQ(), this.moves, this.id, false)
            // console.log(`Agent ${this.id} died from too many moves.`);
            this.makeExplosion();
            // document.getElementById(`stats`).innerHTML = `Agent ${this.id} Score: ${this.score}`;
            // document.getElementById(`historystats`).innerHTML += `<li>Agent ${this.id} Q:${this.endingQ} M:${this.moves}</li>`;
            // localStorage.setItem(`agent_${this.id}`, JSON.stringify(this.history));
        }

        if(cell.id === 99){
            // winner
            
          
            this.alive = false;
            this.currentCell = cell;
            this.endingQ = cell.getQ();
            this.agent.play(`eat`).on('animationcomplete', () => {
            this.agent.destroy();
            });
            this.scene.sound.play('win', { volume: 0.15 });
            this.cb(cell.getQ(), this.moves, this.id, false); 
      
            
        } else if(cell.status !== 0){
            // console.log(`Agent ${this.id} moved to Cell: ${cell}`);
            // cell.updateStatus(3);
            this.currentCell = cell;
            this.score += cell.getQ();
            // console.log(`history: ${this.history.length}`);
            // this.history[this.history.length - 1].cell.updateStatus(4);
        } else {
            
            this.currentCell = cell;
            this.endingQ = cell.getQ();
            
            if(cell.id === this.history[this.history.length - 2] + 1){ // right
                this.x += 50;
                
            } else if(cell.id === this.history[this.history.length - 2] - 1){ // left
                this.x -= 50;
                
            } else if(cell.id === this.history[this.history.length - 2] + 10){ // down
             
                this.y +=  50;
            } else if(cell.id === this.history[this.history.length - 2] - 10){ // up
             
                this.y -=  50;
            }
            
            this.scene.sound.play('pop', { volume: 0.15 });

            cell.setColor(0xff0000);
            setTimeout(() => {
                cell.setColor(0xBCDEE6);
            },250);
            
            this.cb(cell.getQ(), this.moves, this.id, false)
            this.makeExplosion();
            this.alive = false;
        }


    }
    move(cell) {
        
        this.moves++
        this.setCurrentCell(cell)
        if(this.alive){
            this.x = cell.x + 20;
            this.y = cell.y + 20;
            this.update();

            return true
        } else {
            // console.log(`Agent ${this.id} is dead.`);
            if(this.agent){
                this.agent.destroy();
            }
            
            
            return false
        } 
        
    }
    updateScore(score) {
        this.score += score
    }
    calculateReward(cell){

        const ALREADY_VISITED_PENALTY = -1; // how much to penalize already visited cells?
        const Q_REWARD = 1; // how much to reward cells with higher Q values?
        const REWARD = Q_REWARD / cell.getQ(); // reward is Q value divided by Q_REWARD

        const alreadyVisited = this.history.filter((cell_) => {
            return cell_.id === cell.id
        })
        if(alreadyVisited.length > 0){
            return -1
        }



    }
    makeExplosion(){
        if(this.scene){
            let explosion = this.scene.add.sprite(this.x + 25, this.y + 50, `explosion`);
            explosion.anims.play(`explode`);
            explosion.on('animationcomplete', () => {
                explosion.destroy();
            });
        }
        
    }
    update() {
        this.agent.x = this.x;
        this.agent.y = this.y;
    }
}