import * as tf from '@tensorflow/tfjs/dist/tf.fesm.js';

const d = document.getElementById('dataCount')

export enum SequentialLayers {
  Dense = 1,
  Conv2D = 2,
  MaxPooling2D = 3,
  Flatten = 4,
  Dropout = 5
}

export interface createModelInput {
  units: number;
  inputShape: number[];
  activation: string;
}

export interface trainModelInput {
  X: number[][];
  y: number[][];
  epochs: number;
}


export class MazeSolver {

  model: tf.Sequential | tf.LayersModel; // Seq if training, Layers if loading
  active: boolean = false;
  constructor(debug?: boolean) {
    tf.setBackend('webgl'); // to use shader on the GPU
    if (debug) tf.enableDebugMode();
    console.log(`Tensorflow backend: ${tf.getBackend()}`);
    this.model = tf.sequential(); // Sequential model to start
  }
  async createModel(): Promise<void> {

    this.model = tf.sequential() as tf.Sequential;
    (this.model as tf.Sequential).add(tf.layers.dense({
      units: 64,
      inputShape: [100],
      activation: 'relu'
    }));
    (this.model as tf.Sequential).add(tf.layers.dense({
      units: 4,
      activation: 'linear'
    }));

    this.model.compile({
      optimizer: tf.train.adam(),
      loss: 'meanSquaredError'
    });

    this.active = true;

  }
  async trainModel(X: number[][], y: number[][], epochs = 20): Promise<void> {

    const xs = tf.tensor2d(removeDupes(X));
    const ys = tf.tensor2d(removeDupes(y));

    await this.model.fit(xs, ys, {
      epochs: epochs,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}/${epochs} : loss = ${logs.loss}`);
          d.innerHTML = `Epoch ${epoch + 1}/${epochs} : loss = ${logs.loss.toFixed(4)}`;
        }
      }
    });

    xs.dispose();
    ys.dispose();
  }
  predict(X: number[][]) {
    const xs = tf.tensor2d(X);
    return this.model.predict(xs).data();
  }
  saveModel(): void {
    this.model.save('downloads://mazeSolver');
  }
  getModel(): tf.Sequential | tf.LayersModel {
    return this.model;
  }
  async loadModel(): Promise<boolean> {

    const jsonUpload = document.getElementById('json-upload');
    const weightsUpload = document.getElementById('weights-upload');
    const aiStatus = document.getElementById('aiStatus');
    if(!(jsonUpload as any).files[0]  || !(weightsUpload as any).files[0]){
      return false;
    }
    this.model = await tf.loadLayersModel(tf.io.browserFiles([(jsonUpload as any).files[0], (weightsUpload as any).files[0]]));
    
    await this.model.compile({
      optimizer: tf.train.adam(),
      loss: 'meanSquaredError'
    });

    this.active = true;
    aiStatus.innerHTML = 'Model Loaded';
    return true
  }
  getTrainedWeights(): number[] {
    return this.model.getWeights()[0].dataSync();
  }
  getTrainedBiases(): number[] {
    return this.model.getWeights()[1].dataSync();
  }
  createModelFromWeights(weights: number[], biases: number[]): void {
    this.model = tf.sequential() as tf.Sequential;
    (this.model as tf.Sequential).add(tf.layers.dense({
      units: 64,
      inputShape: [100],
      activation: 'relu',
      weights: [tf.tensor2d(weights, [100, 64]), tf.tensor1d(biases)]
    }));
    (this.model as tf.Sequential).add(tf.layers.dense({
      units: 4,
      activation: 'linear'
    }));
    this.model.compile({
      optimizer: tf.train.adam(),
      loss: 'meanSquaredError'
    });
    this.active = true;
  }
  

}


// function to remove all duplicates from an array
function removeDupes(arr: any[]){
  // find all unique values
  const unique = arr.filter((v, i, a) => a.indexOf(v) === i);
  return unique; 
}






