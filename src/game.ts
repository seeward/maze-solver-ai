import 'phaser';
import  MainScene from './scenes/mainScene';

const config = {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#ffffff',
    width: 1100,
    height: 1100,
    scene: MainScene
};

new Phaser.Game(config);
