import './style.css';
import { Car } from './Car';
import { Road } from './Road';
import { NetworkVisualizer } from './NetworkVisualizer';
import { NeuralNetwork } from './NeuralNetwork';

document.getElementById('saveButton')!.addEventListener('click', save);
document.getElementById('discardButton')!.addEventListener('click', discard);

const carCanvas = document.getElementById('carCanvas') as HTMLCanvasElement;
carCanvas.width = 200;

const networkCanvas = document.getElementById(
    'networkCanvas'
) as HTMLCanvasElement;
networkCanvas.width = 400;

const carCtx = carCanvas.getContext('2d') as CanvasRenderingContext2D;
const networkCtx = networkCanvas.getContext('2d') as CanvasRenderingContext2D;

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const numberOfCars = 100;
const cars = generateCars(numberOfCars);
let bestCar = cars[0];
if (localStorage.getItem('bestBrain')) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem('bestBrain')!);
        if (i !== 0) {
            NeuralNetwork.mutate(cars[i].brain!, 0.2);
        }
    }
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, 'traffic', 2),
    new Car(road.getLaneCenter(0), -300, 30, 50, 'traffic', 2),
    new Car(road.getLaneCenter(2), -300, 30, 50, 'traffic', 2),
    new Car(road.getLaneCenter(0), -500, 30, 50, 'traffic', 2),
    new Car(road.getLaneCenter(1), -500, 30, 50, 'traffic', 2),
    new Car(road.getLaneCenter(1), -700, 30, 50, 'traffic', 2),
    new Car(road.getLaneCenter(2), -700, 30, 50, 'traffic', 2),
];

animate();

function save() {
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem('bestBrain');
}

function generateCars(n: number) {
    const cars = [];
    for (let i = 1; i < n; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, 'AI'));
    }
    return cars;
}

function animate(time: number) {
    for (const car of traffic) {
        car.update(road.borders, []);
    }

    cars.forEach((car) => car.update(road.borders, traffic));
    bestCar = cars.find(
        (car) => car.y === Math.min(...cars.map((c) => c.y))
    ) as Car;

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar!.y + carCanvas.height * 0.7);

    road.draw(carCtx);
    for (const car of traffic) {
        car.draw(carCtx, 'red');
    }

    carCtx.globalAlpha = 0.2;
    cars.forEach((car) => car.draw(carCtx, 'blue'));
    carCtx.globalAlpha = 1;
    bestCar!.draw(carCtx, 'blue', true);

    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    NetworkVisualizer.drawNetwork(networkCtx, bestCar.brain!);

    requestAnimationFrame(animate);
}
