import { useState, useEffect, useRef } from "react";

interface IBoid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: number[][];
  draw: () => void;
  applyForce: (fx: number, fy: number) => void;
}

function BoidsCanvas() {
  const canvasWidth = 500;
  const canvasHeight = 500;
  const showFps = false;

  const boids = useRef<IBoid[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas == null) {
      console.log("null canvas :(");
      return;
    }

    const ctx = canvas.getContext("2d");

    if (ctx == null) {
      console.log("null ctx :(");
      return;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const boid = createBoid(ctx, 100, 100);
    boid.draw();
  }, []);

  /** instantiates and creates x number of boids and places them randomly */
  const createRandomBoids = () => {};

  /** instantiates a new boid object */
  const createBoid = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    console.debug("creating boid...");

    const boid: IBoid = {
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      color: "green",
      shape: [[30, 15], [20, 0], [30, -15]],
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let i = 0; i < this.shape.length; i++) {
          const coords = this.shape[i];
          ctx.lineTo(x + coords[0], y + coords[1]);
        }
        ctx.closePath();
        ctx.fill();
      },
      applyForce(x: number, y: number) {
        this.vx += x;
        this.vy += y;
      }
    };

    return boid;
  };

  /** frame update */
  const update = (ctx: CanvasRenderingContext2D) => {
    
  };

  return (
    <canvas
      id="boids-canvas"
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        border: "1px solid black"
      }}
    >
    </canvas>
  )
}

export { BoidsCanvas };
