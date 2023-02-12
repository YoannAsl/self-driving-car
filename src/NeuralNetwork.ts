import { lerp } from './utils';

export class NeuralNetwork {
    levels: Level[];

    constructor(neuronCount: number[]) {
        this.levels = [];
        for (let i = 0; i < neuronCount.length - 1; i++) {
            this.levels.push(new Level(neuronCount[i], neuronCount[i + 1]));
        }
    }

    static feedForward(givenInputs: number[], network: NeuralNetwork) {
        let outputs = Level.feedForward(givenInputs, network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }

        return outputs;
    }

    static mutate(network: NeuralNetwork, amount = 1) {
        network.levels.forEach((level) => {
            for (let bias of level.biases) {
                bias = lerp(bias, Math.random() * 2 - 1, amount);
            }

            for (let weight of level.weights) {
                for (let i = 0; i < weight.length; i++) {
                    weight[i] = lerp(weight[i], Math.random() * 2 - 1, amount);
                }
            }
        });
    }
}

export class Level {
    inputs: number[];
    outputs: number[];
    biases: number[];
    weights: number[][];

    constructor(inputCount: number, outputCount: number) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        Level.#randomize(this);
    }

    static #randomize(level: Level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    static feedForward(givenInputs: number[], level: Level) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            if (sum > level.biases[i]) level.outputs[i] = 1;
            else level.outputs[i] = 0;
        }

        return level.outputs;
    }
}
