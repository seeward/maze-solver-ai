import 'phaser';
import  MainScene from './scenes/mainScene';
import IntroScene from './scenes/introScene';

const config = {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#000000',
    width: 1000,
    height: 1000,
    scene: MainScene
};

new Phaser.Game(config);
