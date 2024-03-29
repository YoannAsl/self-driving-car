import { Car } from './Car';
import { Road } from './Road';
import { getIntersection, lerp } from './utils';

type Ray = {
    x: number;
    y: number;
}[];
interface Reading {
    x: number;
    y: number;
    offset: number;
}

export class Sensor {
    car: Car;
    rayCount: number = 5;
    rayLength: number = 150;
    raySpread = Math.PI / 2;
    rays: Ray[] = [];
    readings: (Reading | null)[] = [];

    constructor(car: Car) {
        this.car = car;
    }

    update(roadBorders: Road['borders'], traffic: Car[] | []) {
        this.#castRays();
        this.readings = [];
        for (const ray of this.rays) {
            this.readings.push(this.#getReading(ray, roadBorders, traffic));
        }
    }

    #getReading(
        ray: Ray,
        roadBorders: Road['borders'],
        traffic: Car[] | []
    ): Reading | null {
        let touches = [];

        for (const border of roadBorders) {
            const touch = getIntersection(ray[0], ray[1], border[0], border[1]);
            if (touch) touches.push(touch);
        }

        for (const trafficCar of traffic) {
            const poly = trafficCar.polygon;
            for (let i = 0; i < poly.length; i++) {
                const touch = getIntersection(
                    ray[0],
                    ray[1],
                    poly[i],
                    poly[(i + 1) % poly.length]
                );
                if (touch) touches.push(touch);
            }
        }
        if (touches.length === 0) return null;

        const offsets = touches.map((touch) => touch.offset);
        const minOffset = Math.min(...offsets);
        return touches.find((touch) => touch.offset === minOffset)!;
    }

    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle =
                lerp(
                    this.raySpread / 2,
                    -this.raySpread / 2,
                    this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
                ) + this.car.angle;

            const start = { x: this.car.x, y: this.car.y };
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength,
            };
            this.rays.push([start, end]);
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.rayCount; i++) {
            let end = this.rays[i][1];
            if (this.readings[i]) end = this.readings[i]!;

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'yellow';
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';
            ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }
}
