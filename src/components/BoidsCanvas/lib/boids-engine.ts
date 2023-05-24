import { CanvasEngine } from "./engine/engine";

export class Boid {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  velocity: number = 0;
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
    this.velocity = 1;
    this.rotation = 0;
    this.color = color;
  }

  deg2Rad(degree: number) {
    return ((degree * Math.PI) / 180);
  };

  draw() {
    this.ctx.fillStyle = this.color;

    // change context origin to point of boid, then rotate
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.deg2Rad(this.rotation));
    this.ctx.translate(-this.x, -this.y);

    // draw boid
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    for (let i = 0; i < this.shape.length; i++) {
      const coords = this.shape[i];
      this.ctx.lineTo(this.x + coords[0], this.y + coords[1]);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // draw boid forward vector debug line
    this.ctx.strokeStyle = "#48CAE4";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    this.ctx.lineTo(this.x - 50, this.y);
    this.ctx.stroke();
  };

  applyForce(fx: number, fy: number) {
    this.vx += fx;
    this.vy += fy;
  };

  /** updates direction calculations & redraws to screen */
  update() {
    const rotRad = this.deg2Rad(this.rotation);
    const direction = [
      Math.cos(rotRad),
      Math.sin(rotRad)
    ];

    this.x -= direction[0] * this.velocity;
    this.y -= direction[1] * this.velocity;
    // this.rotation += 1;

    // TODO: implement seperation, alignment, & cohesion

    this.draw();
    this.ctx.resetTransform();
  }
}

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
    const boid = new Boid(this.ctx, x, y, 0, 0, color);
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
