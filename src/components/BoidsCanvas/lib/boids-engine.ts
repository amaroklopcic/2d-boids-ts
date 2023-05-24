import { CanvasEngine } from "./engine/engine";

export class Boid {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  readonly shape: number[][] = [[30, 15], [25, 0], [30, -15]];

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    vx: number = 0,
    vy: number = 0,
    color: string = "green",
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
  }

  draw() {
    console.log("draw");
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    for (let i = 0; i < this.shape.length; i++) {
      const coords = this.shape[i];
      this.ctx.lineTo(this.x + coords[0], this.y + coords[1]);
    }
    this.ctx.closePath();
    this.ctx.fill();
  };

  applyForce(fx: number, fy: number) {
    this.vx += fx;
    this.vy += fy;
  };
}

export class BoidsEngine {
  ctx: CanvasRenderingContext2D;
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
    this.engine = new CanvasEngine(ctx, width, height, fpsLimit, fpsDisplay);
    this.boids = [];
  }

  /** starts the `CanvasEngine` */
  async start() {
    this.engine.addStartHook(() => {
      const boid = this.createBoid(100, 100);
      boid.draw();
    });
    await this.engine.start();
  };

  /** stops the `CanvasEngine` */
  async stop() {
    await this.engine.stop();
  };

  /** instantiates a new boid object */
  createBoid(x: number, y: number) {
    console.debug("creating boid...");    
    const boid = new Boid(this.ctx, x, y, 0, 0, "#0077B6");
    this.boids.push(boid);
    return boid;
  };

  /** instantiates and creates x number of boids and places them randomly */
  createRandomBoids() {
    // nice blue color palette:
    // https://coolors.co/palette/03045e-023e8a-0077b6-0096c7-00b4d8-48cae4-90e0ef-ade8f4-caf0f8
    for(let i = 1; i < 20; i++) {
      const boid = this.createBoid(i * 30, i * 30);
      boid.applyForce(30, 30);
    }
  };
}
