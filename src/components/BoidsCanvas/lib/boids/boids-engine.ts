import { CanvasEngine } from '../engine/engine';
import { Vector2D, rad2Deg, signAngle } from '../math-helpers';
import { Boid } from './boids';

export class BoidsEngine {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  engine: CanvasEngine;
  boids: Array<Boid>;

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    fpsLimit = 60,
    fpsDisplay = false,
  ) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.engine = new CanvasEngine(ctx, width, height, fpsLimit, fpsDisplay);
    this.boids = [];
  }

  /** starts the `CanvasEngine` */
  async start() {
    this.engine.addStartHook(() => {
      this.bulkCreateBoids();
    });
    this.engine.addUpdateHook(() => {
      this.update();
    });
    await this.engine.start();
  }

  /** stops the `CanvasEngine` */
  async stop() {
    await this.engine.stop();
    this.boids = [];
  }

  /** instantiates a new boid object */
  createBoid(x: number, y: number, color = '#0077B6') {
    console.debug('creating boid...');
    const boid = new Boid(this, x, y, color);
    this.boids.push(boid);
    return boid;
  }

  /** instantiates and creates x number of boids and places them randomly */
  bulkCreateBoids() {
    const boidCount = 60;
    const differentColors = ['#023E8A', '#0077B6', '#0096C7'];

    // two boids going towards each other
    // const boid = this.createBoid(400, 100, "blue");
    // boid.rotation = 135;

    // const boid2 = this.createBoid(300, 200, "red");
    // boid2.rotation = 345;

    const center = new Vector2D(this.width / 2, this.height / 2);

    // nice blue color palette:
    // https://coolors.co/palette/03045e-023e8a-0077b6-0096c7-00b4d8-48cae4-90e0ef-ade8f4-caf0f8
    for (let i = 1; i < boidCount; i++) {
      const x = this.width * Math.random();
      const y = this.height * Math.random();

      const boid = this.createBoid(x, y, differentColors[i % 3]);

      if (i === 1) {
        boid.color = '#EC0B43';
        boid.debug = true;
      }

      const targetVec = Vector2D.subtract(center, boid.pos);
      const targetRotation = rad2Deg(Math.atan2(targetVec.y, targetVec.x));
      boid.rotation = signAngle(targetRotation + 180 * Math.random() - 90);
    }
  }

  /** run all the boids updates */
  update() {
    // check for out of bounds boids and remove them
    // this.boids = this.boids.filter(
    //   (boid) => boid.pos.x < (this.width + 200) || boid.pos.y < (this.height + 200)
    // );

    const [width, height] = [this.width, this.height];
    for (let i = 0; i < this.boids.length; i++) {
      const boid = this.boids[i];

      // teleport boid to other side of canvas if out of bounds
      if (boid.pos.x < 0) boid.setPos(width + boid.pos.x, boid.pos.y);
      if (boid.pos.x > width) boid.setPos(boid.pos.x - width, boid.pos.y);
      if (boid.pos.y < 0) boid.setPos(boid.pos.x, height + boid.pos.y);
      if (boid.pos.y > height) boid.setPos(boid.pos.x, height - boid.pos.y);

      boid.update();
    }
  }
}
