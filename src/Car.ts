import { Controls } from './Controls';
import { Sensor } from './Sensor';
import { Road } from './Road';
import { polysIntersect } from './utils';

export class Car {
    x: number;
    y: number;
    width: number;
    height: number;
    controls: Controls;
    speed: number = 0;
    acceleration: number = 0.2;
    maxSpeed: number;
    friction: number = 0.05;
    angle: number = 0;
    sensor: Sensor | null = null;
    polygon: { x: number; y: number }[] = [];
    damaged: boolean = false;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        controlType: string,
        maxSpeed = 3
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxSpeed = maxSpeed;

        this.controls = new Controls(controlType);
        if (controlType !== 'traffic') this.sensor = new Sensor(this);
    }

    update(roadBorders: Road['borders'], traffic: Car[] | []) {
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        if (this.sensor) this.sensor.update(roadBorders, traffic);
    }

    #assessDamage(roadBorders: Road['borders'], traffic: Car[] | []) {
        for (const border of roadBorders) {
            if (polysIntersect(this.polygon, border)) return true;
        }

        for (const trafficCar of traffic) {
            if (polysIntersect(this.polygon, trafficCar.polygon)) return true;
        }

        return false;
    }

    #createPolygon() {
        const points = [];
        const radius = Math.hypot(this.width, this.height) / 2;
        const angle = Math.atan2(this.width, this.height);

        points.push({
            x: this.x - Math.sin(this.angle - angle) * radius,
            y: this.y - Math.cos(this.angle - angle) * radius,
        });
        points.push({
            x: this.x - Math.sin(this.angle + angle) * radius,
            y: this.y - Math.cos(this.angle + angle) * radius,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - angle) * radius,
            y: this.y - Math.cos(Math.PI + this.angle - angle) * radius,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + angle) * radius,
            y: this.y - Math.cos(Math.PI + this.angle + angle) * radius,
        });

        return points;
    }

    #move() {
        if (this.controls.forward) this.speed += this.acceleration;
        if (this.controls.reverse) this.speed -= this.acceleration;

        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2;

        if (this.speed > 0) this.speed -= this.friction;
        if (this.speed < 0) this.speed += this.friction;
        if (Math.abs(this.speed) < this.friction) this.speed = 0;

        if (this.speed !== 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left) this.angle += 0.03 * flip;
            if (this.controls.right) this.angle -= 0.03 * flip;
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx: CanvasRenderingContext2D, color: string) {
        if (this.damaged) ctx.fillStyle = 'gray';
        else ctx.fillStyle = color;

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        if (this.sensor) this.sensor.draw(ctx);
    }
}
