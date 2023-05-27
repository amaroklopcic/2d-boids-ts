import { Vector2D, clamp, deg2Rad, getVectorsAverage, lerp, rad2Deg, signAngle } from "../math-helpers";
import { BoidsEngine } from "./boids-engine";

export class Boid {
  ctx: CanvasRenderingContext2D;
  engine: BoidsEngine;
  pos: Vector2D;
  color: string;
  rotation: number;
  velocity: number = 5;
  fishTailLerpValue = 0;
  fishTailLerpTarget = 1;
  debug: boolean = true;
  readonly shape: Vector2D[] = [
    new Vector2D(-30, 10),
    new Vector2D(-25, 0),
    new Vector2D(-30, -10)
  ];
  readonly boundingBoxStartPos: Vector2D = new Vector2D(-30, -10);
  readonly boundingBoxEndPos: Vector2D = new Vector2D(30, 20);

  constructor(
    engine: BoidsEngine,
    x: number,
    y: number,
    color: string = "green",
  ) {
    this.engine = engine;
    this.ctx = engine.ctx;
    this.pos = new Vector2D(x, y);
    this.rotation = 0;
    this.color = color;
  };

  draw() {
    this.drawShape();

    // draw bounding box debug line
    if (this.debug) {
      this.drawDebugBoundingBox();
      this.drawDebugDirectionVector();
      this.drawDebugNearbyVoids();
    }
  };

  drawShape() {
    const ctx = this.ctx;

    ctx.fillStyle = this.color;

    // change context origin to point of boid, then rotate
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(deg2Rad(this.rotation));
    ctx.translate(-this.pos.x, -this.pos.y);

    // draw boid
    ctx.beginPath();
      ctx.moveTo(this.pos.x, this.pos.y);
      for (let i = 0; i < this.shape.length; i++) {
        const coords = this.shape[i];
        this.ctx.lineTo(this.pos.x + coords.x, this.pos.y + coords.y);
      }
    ctx.fill();
  };

  drawDebugBoundingBox() {
    const ctx = this.ctx;

    const [start, end] = this.getBoundingBox();

    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;

    ctx.beginPath();
      // draw rect
      ctx.moveTo(start.x, start.y);
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      // diagonal line
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };

  drawDebugDirectionVector() {
    const ctx = this.ctx;

    const forward = this.getForwardVector();
    const magnitude = 50;

    ctx.fillStyle = "green";
    ctx.strokeStyle = "green";
    ctx.lineWidth = 1;

    // we want to test `this.getForwardVector()`, so we're resetting the
    // canvas transforms so we can draw from a canvas perspective instead of a
    // local boid perspective
    ctx.resetTransform();

    // draw circle around boid tip
    ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, 4, 0, Math.PI * 4, true);
      ctx.fill();
    ctx.stroke();

    // draw line showing direction vector
    ctx.beginPath();
      ctx.moveTo(this.pos.x, this.pos.y);
      ctx.lineTo(
        this.pos.x + (forward.x * magnitude),
        this.pos.y + (forward.y * magnitude)
      );
    ctx.stroke();
  };

  drawDebugFov() {};

  drawDebugNearbyVoids() {
    const ctx = this.ctx;

    const maxRange = 150;
    const fov = 225;
    const boids = this.getNearbyBoids(maxRange, fov);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;

    ctx.resetTransform();

    // TODO: draw transparent arc
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
      ctx.moveTo(this.pos.x, this.pos.y);
      ctx.arc(
        this.pos.x,
        this.pos.y,
        maxRange,
        deg2Rad(this.rotation - (fov / 2)), deg2Rad(this.rotation + (fov / 2))
      );
    ctx.fill();
    ctx.globalAlpha = 1;

    for (const boid of boids) {
      ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(boid.pos.x, boid.pos.y);
      ctx.stroke();
    }
  };

  /** Returns a list of 2 vectors, the first being the start position of the
   * bounding box and the second being the end position.
   * 
   * The vectors returned take the current position and `boundingBoxPos`
   * into account.
  */
  getBoundingBox(): Vector2D[] {
    const [x, y] = [this.pos.x, this.pos.y];
    const start = this.boundingBoxStartPos;
    const end = this.boundingBoxEndPos;

    return [
      new Vector2D(x + start.x, y + start.y),
      new Vector2D(x + start.x + end.x, y + start.y + end.y),
    ]
  };

  /** Returns the boids normalized forward direction vector. */
  getForwardVector(rotationOffset: number = 0) {
    const rotRad = deg2Rad(this.rotation + rotationOffset);
    return new Vector2D(Math.cos(rotRad), Math.sin(rotRad))
  };

  /** Returns a list of `Boid` objects within the specified `range` and within
   *  the boids fov, in degrees.
  */
  getNearbyBoids(range: number, fov: number = 360) {
    const boids = this.engine.boids;

    const returnVal = [];

    let length = boids.length;
    while(length--) {
      const boid = boids[length];
      const distance = Vector2D.distance(this.pos, boid.pos);
      if (boid !== this && distance < range) {
        if (fov === 360) {
          returnVal.push(boid);
          continue;
        }

        const targetVec = Vector2D.subtract(boid.pos, this.pos);
        const targetAngle = rad2Deg(Math.atan2(targetVec.y, targetVec.x));
        const fovHalf = fov / 2;
        const signedAngle = signAngle(this.rotation);
        const minAngle = ((signedAngle + 360) % 360) - fovHalf;
        const maxAngle = ((signedAngle + 360) % 360) + fovHalf;
        const positiveTargetAng = (targetAngle + 360) % 360;

        if (positiveTargetAng <= maxAngle && positiveTargetAng >= minAngle) {
          returnVal.push(boid);
        }
      }
    }

    return returnVal;
  };

  /** Set boid position. */
  setPos(x: number, y: number) {
    this.pos = new Vector2D(x, y);
  };

  /** updates direction calculations & redraws to screen */
  update() {
    const forward = this.getForwardVector();

    this.setPos(
      this.pos.x + (forward.x * this.velocity),
      this.pos.y + (forward.y * this.velocity)
    );

    // this.x += direction[0] * this.velocity * (1000 / dt);
    // this.y += direction[1] * this.velocity * (1000 / dt);

    // TODO: implement seperation, alignment, & cohesion
    this.updateFishTailEffect();
    this.updateSeparation();
    this.updateAlignment();
    // this.updateCohesion();
    this.updateCanvasBoundsAvoidance();

    this.draw();
    this.ctx.resetTransform();
  };

  /** Gives boids a fish tail effect to make them look more alive. */
  updateFishTailEffect() {
    const maxRotation = 1;
    const lerpDegree = 0.7;

    if (this.fishTailLerpValue > 0.98) {
      this.fishTailLerpTarget = -1;
    }
    if (this.fishTailLerpValue < -0.98) {
      this.fishTailLerpTarget = 1;
    }

    this.fishTailLerpValue = lerp(
      this.fishTailLerpValue,
      this.fishTailLerpTarget,
      lerpDegree
    );

    this.rotation += (maxRotation * this.fishTailLerpValue);
  };

  /** steer to avoid crowding local flockmates */
  updateSeparation() {
    // TODO: the seperation sort of works but in an unexpected way...
    // I think what's going on is we're just rotating in the same direction
    // (clockwise) regardless of the direction that would be easier for the
    // boid to take
    const separationRange = 150;
    const maxRotationSpeed = 6;

    const boidsInRange = this.getNearbyBoids(separationRange);

    for (const boid of boidsInRange) {
      const distance = Vector2D.distance(this.pos, boid.pos);

      // get direction angle of other boid
      // const signedAngle = signAngle(this.rotation);
      const targetVec = Vector2D.subtract(boid.pos, this.pos);
      const angleDiff = rad2Deg(Math.atan2(targetVec.y, targetVec.x));
      const rotationDir = clamp(-angleDiff, -1, 1);
      const lerpedRotation = Math.min(maxRotationSpeed, Math.abs(angleDiff));

      this.rotation += rotationDir * lerpedRotation;
    }
  };

  /** Steer towards the average heading of local flockmates */
  updateAlignment() {
    const alignmentRange = 150;
    // degrees per frame (6 degrees * 60 fps = 360 degrees of rotation per s)
    const maxRotationSpeed = 1;

    const boidsInRange = this.getNearbyBoids(alignmentRange);

    if (boidsInRange.length < 1) {
      return;
    }

    const boidRots = boidsInRange.map((boid) => boid.rotation);

    let totalRot = 0;
    for (let i = 0; i < boidRots.length; i++) {
      totalRot += boidRots[i];
    }

    const averageRot = totalRot / boidsInRange.length;

    const rotationDiff = signAngle(averageRot - this.rotation);
    const rotationDir = clamp(-rotationDiff, -1, 1);
    const lerpedRotation = Math.min(maxRotationSpeed, Math.abs(rotationDiff));

    this.rotation += rotationDir * lerpedRotation;
  };

  /** Steer to move towards the average position (center of mass) of local
   * flockmates.
  */
  updateCohesion() {
    // TODO: finish implementing
    const cohesionRange = 1000;
    const maxRotationSpeed = 3;
    const maxStrength = 0.5;

    const boidsInRange = this.getNearbyBoids(cohesionRange);

    if (boidsInRange.length < 1) {
      return;
    }

    const boidPositions = boidsInRange.map((boid) => boid.pos);
    // const averageCenter = getVectorsAverage(boidPositions);
    const averageCenter = new Vector2D(
      this.engine.width / 2,
      this.engine.height / 2
    );

    const signedAngle = signAngle(this.rotation);
    const targetVec = Vector2D.subtract(averageCenter, this.pos);
    const angleDiff = rad2Deg(Math.atan2(targetVec.y, targetVec.x));

    // now apply rotation force
    const maxRotationStrenth = maxRotationSpeed * maxStrength;
    // const rotationDir = this.clamp(-angle + 0.01, -1, 1);
    const rotationStrenth = maxRotationSpeed * (1 - (1 / (signedAngle / -angleDiff)));
    console.log(rotationStrenth);

    this.rotation = this.rotation / lerp(this.rotation, angleDiff, 0.9);
  };

  /** Steer to avoid going outside the canvas. */
  updateCanvasBoundsAvoidance() {
    const checkAngles = [-90, -60, -30, 0, 30, 60, 90];
    const traceDistance = 300;
    const maxRotationSpeed = 5;

    for (const angle of checkAngles) {
      const direction = this.getForwardVector(angle);

      const predictedX = clamp(
        this.pos.x + (direction.x * traceDistance),
        0,
        this.engine.width
      );
      const predictedY = clamp(
        this.pos.y + (direction.y * traceDistance),
        0,
        this.engine.height
      );
      const predictedVector = new Vector2D(predictedX, predictedY);

      const distance = Vector2D.distance(this.pos, predictedVector);
      const rotationDir = clamp(-angle + 0.01, -1, 1);
      const rotationStrenth = (1 - (1 / (traceDistance / Math.max(distance, 1))));

      this.rotation += maxRotationSpeed * rotationDir * rotationStrenth;
    }
  };
};
