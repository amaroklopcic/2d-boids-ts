import { sleep, whileGenerator } from './misc';

export class CanvasEngine {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  fpsLimit: number;
  fpsDisplay: boolean;
  state: 'RUNNING' | 'STOPPED';
  stateDesired: 'RUNNING' | 'STOPPED';
  startHooks: Array<() => void>;
  stopHooks: Array<() => void>;
  updateHooks: Array<() => void>;
  /** holds a collection of deltaTimes for getting a more readable fps counter */
  deltaTimeBuffer: number[] = [];
  /** milliseconds elapsed since last frame */
  deltaTime = 0;

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
    this.fpsLimit = fpsLimit;
    this.fpsDisplay = fpsDisplay;
    this.state = 'STOPPED';
    this.stateDesired = 'STOPPED';
    this.startHooks = [];
    this.stopHooks = [];
    this.updateHooks = [];
  }

  sleep = sleep;

  /** starts the event loop and sets engine state to "RUNNING" */
  async start() {
    if (this.state === 'RUNNING') {
      console.debug('already running, aborting');
      return;
    }

    console.debug('starting engine...');

    this.stateDesired = 'RUNNING';

    console.debug(`running ${this.startHooks.length} start hooks...`);
    for (let i = 0; i < this.startHooks.length; i++) {
      this.startHooks[i]();
    }

    // start event loop
    console.debug('starting event loop...');
    await this.update();
  }

  /** stops the event loop and sets engine state to "STOPPED" */
  async stop() {
    if (this.state === 'STOPPED') {
      console.debug('already stopped, aborting');
      return;
    }

    console.debug('stopping engine...');
    this.stateDesired = 'STOPPED';

    // wait for engine state to be "STOPPED" before running stop hooks
    for (const i of whileGenerator()) {
      if (this.state !== 'RUNNING') {
        break;
      }
      console.debug(`waiting for event loop to stop... (${i}ms elapsed)`);
      await this.sleep(1);
    }

    console.debug(`event loop stopped! running ${this.stopHooks.length} stop hooks...`);
    for (let i = 0; i < this.stopHooks.length; i++) {
      this.stopHooks[i]();
    }
    console.debug('flushing hooks...');
    this.flushHooks();
    console.debug('engine stopped');
  }

  /** gets called every frame (limited by `fpsLimit`) */
  async update() {
    const delay = 1000 / this.fpsLimit;
    let totalFrames = 0;

    for (const i of whileGenerator()) {
      const deltaTimeStart = performance.now();
      totalFrames = i;
      if (this.stateDesired === 'RUNNING') {
        this.state = 'RUNNING';
        this.clearCanvas();
        this.ctx.save();
        this.drawFps();
        for (let i = 0; i < this.updateHooks.length; i++) {
          this.updateHooks[i]();
          this.ctx.restore();
        }
        // adjust time to sleep before next frame with delta time to
        // account for time it took for calculations, drawing, etc.
        // in between frames
        await this.sleep(delay - (this.deltaTime - delay));
      } else {
        console.debug('stopping event loop...');
        break;
      }

      const deltaTimeEnd = performance.now();
      this.deltaTime = deltaTimeEnd - deltaTimeStart;
      this.deltaTimeBuffer.push(this.deltaTime);
      if (this.deltaTimeBuffer.length > 10) {
        this.deltaTimeBuffer.shift();
      }
    }

    this.state = 'STOPPED';
    console.debug(`stopped event loop (${totalFrames} total frames)`);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawFps() {
    if (this.fpsDisplay) {
      let deltaTimeTotal = 0;
      for (const deltaTime of this.deltaTimeBuffer) {
        deltaTimeTotal += deltaTime;
      }
      const deltaTimeAvg = deltaTimeTotal / this.deltaTimeBuffer.length;

      const fps = Math.round(1000 / deltaTimeAvg);
      this.ctx.font = '18px serif';
      this.ctx.fillStyle = 'red';
      this.ctx.fillText(`FPS: ${fps}`, 10, 24);
    }
  }

  flushHooks() {
    this.startHooks = [];
    this.stopHooks = [];
    this.updateHooks = [];
  }

  /** adds a hook to be run when `start()` is called and *before* the event loop is running */
  addStartHook(hook: () => void) {
    console.debug('adding start hook...');
    this.startHooks.push(hook);
  }

  /** adds a hook to be run after `stop()` is called and the *after* event loop is halted */
  addStopHook(hook: () => void) {
    this.stopHooks.push(hook);
  }

  /** adds a hook to be run when `update()` is called */
  addUpdateHook(hook: () => void) {
    this.updateHooks.push(hook);
  }
}
