

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  preload() {
    this.load.image('logo', 'insidemouse.jpeg');
  }

  create() {
    this.add.image(400, 300, 'logo');


  }
}