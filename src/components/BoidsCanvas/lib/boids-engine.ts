import { CanvasEngine } from "./engine/engine";

export class Boid {
  ctx: CanvasRenderingContext2D;
  engine: BoidsEngine;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  velocity: number = 0;
  fishTailLerpValue = 0;
  fishTailLerpTarget = 1;
  readonly shape: number[][] = [[30, 15], [25, 0], [30, -15]];
  readonly boundingBoxDims: number[] = [30, 30];

  constructor(
    engine: BoidsEngine,
    x: number,
    y: number,
    vx: number = 0,
    vy: number = 0,
    color: string = "green",
  ) {
    this.engine = engine;
    this.ctx = engine.ctx;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.velocity = 3;
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

    // draw bounding box debug line
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    // draw rect
    this.ctx.moveTo(this.x, this.y);
    this.ctx.strokeRect(this.x, this.y - 15, 30, 30);
    // diagonal line
    this.ctx.moveTo(this.x, this.y - 15);
    this.ctx.lineTo(this.x + 30, this.y + 15);
    this.ctx.stroke();

    // draw boid forward vector debug line
    // this.ctx.strokeStyle = "#48CAE4";
    // this.ctx.lineWidth = 1;
    // this.ctx.beginPath();
    // this.ctx.moveTo(this.x, this.y);
    // this.ctx.lineTo(this.x - 50, this.y);
    // this.ctx.stroke();
  };

  applyForce(fx: number, fy: number) {
    this.vx += fx;
    this.vy += fy;
  };

  /** fires a trace in a given direction, checking if it hits an bounding boxes */
  fireTrace(directionVector: number[], distance: number) {
    const isVectorInsideBoid = (vector: number[]) => {
      for (let i = 0; i < this.engine.boids.length; i++) {
        const boid = this.engine.boids[i];

        if (boid === this) {
          continue;
        }

        const hitbox = boid.getHitbox();
        const vectorMin = hitbox[0];
        const vectorMax = hitbox[1];
        if (
          (vector[0] > vectorMin[0] && vector[1] > vectorMin[1]) &&
          (vector[0] < vectorMax[0] && vector[1] < vectorMax[1])
        ) {
          return {
            ent: boid,
            distance: i
          };
        }
      };
      return null;
    };

    // draw trace
    // this.ctx.strokeStyle = "green";
    // this.ctx.lineWidth = 1;
    // this.ctx.beginPath();
    // this.ctx.moveTo(this.x, this.y);
    // this.ctx.lineTo(
    //   this.x + (directionVector[0] * distance),
    //   this.y + (directionVector[1] * distance)
    // );
    // this.ctx.stroke();
 
    // from this.x, this.y go towards direction vector
    for (let i = 1; i < distance; i++) {
      const dirVecMag = [
        this.x + (i * directionVector[0]),
        this.y + (i * directionVector[1])
      ];
      // console.log(dirVecMag);
      if (i + 1 === distance) {
        this.ctx.beginPath();
          this.ctx.fillStyle = "green";
          this.ctx.lineWidth = 1;
          this.ctx.arc(this.x, this.y, 5, 0, Math.PI * 4, true);
          this.ctx.fill();
        this.ctx.stroke();

        this.ctx.strokeStyle = "green";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(dirVecMag[0], dirVecMag[1]);
        this.ctx.stroke();
      }
      const result = isVectorInsideBoid(dirVecMag);
      if (result) {
        return result;
      }
    }

    return null;
  };

  /** get a list of all nearby boids positions and bounding boxes */
  getBoidsBoundingBoxes() {
    return this.engine.boids.map((boid) => {
      return {
        boid: boid,
        hitbox: boid.getHitbox()
      };
    });
  };

  getHitbox() {
    // because the x, y coords are at the point of the boid,
    // we need to offset the bounding box start/end pos by
    // half the bounding box
    const bbDims = this.boundingBoxDims;
    const startPos = [this.x, this.y - (bbDims[0] / 2)];
    const endPos = [this.x + bbDims[0], this.y + (bbDims[0] / 2)]
    return [startPos, endPos];
  };

  /** updates direction calculations & redraws to screen */
  update() {
    const rotRad = this.deg2Rad(this.rotation);
    const direction = [
      -Math.cos(rotRad),
      -Math.sin(rotRad)
    ];

    this.x += direction[0] * this.velocity;
    this.y += direction[1] * this.velocity;

    // TODO: implement seperation, alignment, & cohesion
    this.updateFishTailEffect();
    this.updateSeperation();

    this.draw();
    this.ctx.resetTransform();
  };

  /** returns an interpolation between two inputs (`v0` and `v1`),
   * where `v0` is the current value, `v1` is the target, and `t`
   * is theinterpolation degree
   */
  lerp(v0: number, v1: number, t: number) {
    return ((v0 * t) + (v1 * (1 - t)));
  };

  /** gives boids a fish tail effect to make them look more alive */
  updateFishTailEffect() {
    const maxRotation = 1;
    const lerpDegree = 0.7;

    if (this.fishTailLerpValue > 0.98) {
      this.fishTailLerpTarget = -1;
    }
    if (this.fishTailLerpValue < -0.98) {
      this.fishTailLerpTarget = 1;
    }

    this.fishTailLerpValue = this.lerp(
      this.fishTailLerpValue,
      this.fishTailLerpTarget,
      lerpDegree
    );

    this.rotation += (maxRotation * this.fishTailLerpValue);
  };

  clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
  };

  /** drives boids away from each other */
  updateSeperation() {
    const checkAngles = [-90, -60, -30, 0, 30, 60, 90];
    const traceDistance = 150;
    const maxRotationSpeed = 1;

    for (const angle of checkAngles) {
      const rotRad = this.deg2Rad(this.rotation + angle);
      const direction = [
        -Math.cos(rotRad),
        -Math.sin(rotRad)
      ];
      
      const traceResult = this.fireTrace(direction, traceDistance);
      if (traceResult) {
        // introduce angle bias so we aren't diving by 0
        this.rotation += this.clamp(
          maxRotationSpeed * (1 / (-angle + 0.01)) * (traceDistance / (Math.max(traceResult.distance, 1))),
          -maxRotationSpeed,
          maxRotationSpeed
        );
      }
    }
  };

  /** drives boids in alignment with each other */
  updateAlignment() {};

  /** drives boids away from the walls??? */
  updateCohesion() {};
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
