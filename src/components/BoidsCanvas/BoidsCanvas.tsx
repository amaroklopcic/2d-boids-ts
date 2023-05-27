import { useEffect, useRef } from 'react';
import { BoidsEngine } from './lib/boids/boids-engine';

interface IBoidsCanvasProps {
  width?: number;
  height?: number;
  fpsLimit?: number;
  fpsDisplay?: boolean;
}

function BoidsCanvas(props: IBoidsCanvasProps) {
  const canvasWidth = props.width || 500;
  const canvasHeight = props.height || 500;
  const fpsLimit = props.fpsLimit || 60;
  const fpsDisplay = props.fpsDisplay || false;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BoidsEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) return;
    const ctx = canvas.getContext('2d');
    if (ctx == null) return;

    const engine = new BoidsEngine(ctx, canvasWidth, canvasHeight, fpsLimit, fpsDisplay);

    engineRef.current = engine;
  }, [canvasWidth, canvasHeight, fpsLimit, fpsDisplay]);

  const startEngine = () => {
    engineRef.current?.start();
  };

  const stopEngine = () => {
    engineRef.current?.stop();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button onClick={startEngine}>Start</button>
        <button onClick={stopEngine}>Stop</button>
      </div>
      <canvas
        id='boids-canvas'
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          border: '1px solid black',
        }}
      ></canvas>
    </div>
  );
}

export { BoidsCanvas };
