import { CanvasEngine } from "../engine/engine";
import { Boid } from "./boids";

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
    fpsLimit: number = 60,
    fpsDisplay: boolean = false,
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
  };

  /** stops the `CanvasEngine` */
  async stop() {
    await this.engine.stop();
    this.boids = [];
  };

  /** instantiates a new boid object */
  createBoid(x: number, y: number, color: string = "#0077B6") {
    console.debug("creating boid...");
    const boid = new Boid(this, x, y, 0, 0, color);
    this.boids.push(boid);
    return boid;
  };

  /** instantiates and creates x number of boids and places them randomly */
  bulkCreateBoids() {
    const differentColors = [
      "#023E8A",
      "#0077B6",
      "#0096C7"
    ];

    // two boids going towards each other
    const boid = this.createBoid(0, 50, "blue");
    boid.rotation = 180;
    boid.applyForce(1, 1);

    const boid2 = this.createBoid(400, 100, "red");
    boid2.applyForce(1, 1);

    // nice blue color palette:
    // https://coolors.co/palette/03045e-023e8a-0077b6-0096c7-00b4d8-48cae4-90e0ef-ade8f4-caf0f8
    for (let i = 1; i < 20; i++) {
      let x, y, rotation;
      if (i % 2) {
        // right boids
        x = this.width;
        y = (i * 30);
        rotation = 0;
      } else {
        // left boids
        x = -30;
        y = (i * 30);
        rotation = 180;
      }
      const boid = this.createBoid(x, y, differentColors[i % 3]);
      boid.rotation = rotation;
      boid.applyForce(1, 1);
      boid.applyForce(1, 1);
    }
  };

  /** run all the boids updates */
  update() {
    // check for out of bounds boids and remove them
    this.boids = this.boids.filter(
      (boid) => boid.x < (this.width + 200) || boid.y < (this.height + 200)
    );

    for (let i=0; i < this.boids.length; i++) {
      this.boids[i].update();
    }
  };
}
