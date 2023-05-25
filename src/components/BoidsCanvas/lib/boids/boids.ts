import { BoidsEngine } from "./boids-engine";

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
  debug: boolean = false;
  readonly shape: number[][] = [[30, 10], [25, 0], [30, -10]];
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
    if (this.debug) {
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
    }
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
 
    for (let i = 1; i < distance; i++) {
      const dirVecMag = [
        this.x + (i * directionVector[0]),
        this.y + (i * directionVector[1])
      ];

      // draw traces if in debug mode (but only on the last iteration)
      if (this.debug && i + 1 === distance) {
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

  getDirectionVector(rotationOffset: number = 0) {
    const rotRad = this.deg2Rad(this.rotation + rotationOffset);
    return [
      -Math.cos(rotRad),
      -Math.sin(rotRad)
    ];
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
    const direction = this.getDirectionVector();

    this.x += direction[0] * this.velocity;
    this.y += direction[1] * this.velocity;

    // TODO: implement seperation, alignment, & cohesion
    this.updateFishTailEffect();
    this.updateSeparation();
    this.updateAlignment();
    this.updateCanvasBoundsAvoidance();

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

  /** steer to avoid crowding local flockmates */
  updateSeparation() {
    // TODO: additional checks are needed here to check for when the boid is
    // RIGHT next to a flockmate; currently they avoid each other but sometimes
    // end up inside each other resulting in the below not working fully
    const checkAngles = [-90, -60, -30, 0, 30, 60, 90];
    const traceDistance = 150;
    const maxRotationSpeed = 1;

    for (const angle of checkAngles) {
      const direction = this.getDirectionVector(angle);
      
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

  signAngle(angle: number) {
    return this.signedMod((angle + 180), 360) - 180;
  };

  signedMod(a: number, n: number) {
    return a - Math.floor(a / n) * n;
  };

  /** steer towards the average heading of local flockmates */
  updateAlignment() {
    const alignmentRange = 300;
    const maxRotationSpeed = 3;

    const boidsInRange = this.engine.boids.filter(
      (boid) => (
        boid !== this &&
        this.vectorDistance([this.x, this.y], [boid.x, boid.y]) < alignmentRange
      )
    );

    if (boidsInRange.length < 1) {
      return;
    }

    const boidRots = boidsInRange.map((boid) => boid.rotation);

    let totalRot = 0;
    for (let i = 0; i < boidRots.length; i++) {
      totalRot += boidRots[i];
    }

    const averageRot = totalRot / boidsInRange.length;
    const rotationDiff = this.signAngle(averageRot - this.rotation);

    const rotationStrenth = (1 - (1 / rotationDiff));

    // this.rotation = this.signAngle(this.rotation);
    this.rotation += maxRotationSpeed * rotationStrenth;
  };

  /** steer to move towards the average position (center of mass) of local flockmates */
  updateCohesion() {};

  /** gets the distance between two vectors */
  vectorDistance(v0: number[], v1: number[]) {
    return Math.sqrt((v0[0] - v1[0]) ** 2 + (v0[1] - v1[1]) ** 2);
  };

  /** steer to avoid going outside the canvas */
  updateCanvasBoundsAvoidance() {
    const checkAngles = [-90, -60, -30, 0, 30, 60, 90];
    const traceDistance = 300;
    const maxRotationSpeed = 5;

    for (const angle of checkAngles) {
      const direction = this.getDirectionVector(angle);

      const predictedX = this.clamp(
        this.x + (direction[0] * traceDistance),
        0,
        this.engine.width
      );
      const predictedY = this.clamp(
        this.y + (direction[1] * traceDistance),
        0,
        this.engine.height
      );

      const distance = this.vectorDistance([this.x, this.y], [predictedX, predictedY]);
      const rotationDir = this.clamp(-angle + 0.01, -1, 1);
      const rotationStrenth = (1 - (1 / (traceDistance / Math.max(distance, 1))));

      this.rotation += maxRotationSpeed * rotationDir * rotationStrenth;
    }
  };
};
