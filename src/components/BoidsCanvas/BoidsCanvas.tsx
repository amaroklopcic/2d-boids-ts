import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BoidsEngine } from './lib/boids/boids-engine';

interface IBoidsCanvasProps {
  fpsLimit?: number;
  fpsDisplay?: boolean;
}

function BoidsCanvas(props: IBoidsCanvasProps) {
  const fpsLimit = props.fpsLimit || 60;
  const fpsDisplay = props.fpsDisplay || false;

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BoidsEngine | null>(null);

  useLayoutEffect(() => {
    if (canvasWrapperRef.current) {
      setDimensions({
        width: canvasWrapperRef.current.offsetWidth,
        height: canvasWrapperRef.current.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) return;
    const ctx = canvas.getContext('2d');
    if (ctx == null) return;

    const engine = new BoidsEngine(ctx, dimensions.width, dimensions.height, fpsLimit, fpsDisplay);

    engineRef.current = engine;
  }, [dimensions.width, dimensions.height, fpsLimit, fpsDisplay]);

  const startEngine = () => {
    engineRef.current?.start();
  };

  const stopEngine = () => {
    engineRef.current?.stop();
  };

  return (
    <div ref={canvasWrapperRef} className='canvas-wrapper'>
      <canvas
        id='boids-canvas'
        ref={canvasRef}
        width={dimensions.width - 2}
        height={dimensions.height - 2}
        style={{
          border: '2px solid #526980',
        }}
      ></canvas>
      <div className='canvas-overlay'>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={startEngine}>Start</button>
          <button onClick={stopEngine}>Stop</button>
        </div>
      </div>
    </div>
  );
}

export { BoidsCanvas };
