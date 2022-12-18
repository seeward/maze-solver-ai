import 'phaser';
import  MainScene from './scenes/mainScene';


const config = {
    type: Phaser.AUTO,
    backgroundColor: '#ffffff',
    width: 1100,
    height: 1100,
    scene: MainScene
};

const game = new Phaser.Game(config);
