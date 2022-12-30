import 'phaser';


export interface AgentStatsConfig {
    col?: number;
    row?: number;
    id: number;
    name?: string;
    health?: number;
    score: number;
    history?: HistoryStep[];
    moves?: number;
    state?: number; // 1 = win 0 = lose
}

export interface HistoryStep {
    currentCell: number;
    currentCellQ: number;
    currentCol: number;
    currentRow: number;
    currentScore: number;
}
export class AgentStats extends Phaser.GameObjects.Container {
    statsText: Phaser.GameObjects.Text;
    x: number;
    y: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.x = x;
        this.y = y;
    }

    public create() {
        this.statsText = this.scene.add.text(this.x, this.y, '', { fontSize: '20px', color: '#000000' });
    }
    public updateText(config: AgentStatsConfig) {
        if(this.statsText){
            this.statsText.setText(`${config.id} : ${config.score} : ${config.moves} : ${config.state}`);
        }
    }
    public destroy(): void {
        this.statsText.destroy();
    }
}