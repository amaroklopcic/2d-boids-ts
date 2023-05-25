import { sleep, whileGenerator } from "./misc";

export class CanvasEngine {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  fpsLimit: number;
  fpsDisplay: boolean;
  state: "RUNNING" | "STOPPED";
  stateDesired: "RUNNING" | "STOPPED";
  startHooks: Array<() => void>;
  stopHooks: Array<() => void>;
  updateHooks: Array<() => void>;
  lastFrameTimestamp: number = 0;
  deltaTime: number = 0;

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
    this.fpsLimit = fpsLimit;
    this.fpsDisplay = fpsDisplay;
    this.state = "STOPPED";
    this.stateDesired = "STOPPED";
    this.startHooks = [];
    this.stopHooks = [];
    this.updateHooks = [];
  }

  sleep = sleep;

  /** starts the event loop and sets engine state to "RUNNING" */
  async start() {
    if (this.state === "RUNNING") {
      console.debug("already running, aborting");
      return;
    }

    console.debug("starting engine...");

    this.stateDesired = "RUNNING";

    console.debug(`running ${this.startHooks.length} start hooks...`);
    for (let i = 0; i < this.startHooks.length; i++) {
      this.startHooks[i]();
    }

    // start event loop
    console.debug("starting event loop...");
    await this.update();
  }

  /** stops the event loop and sets engine state to "STOPPED" */
  async stop() {
    if (this.state === "STOPPED") {
      console.debug("already stopped, aborting");
      return;
    }

    console.debug("stopping engine...");
    this.stateDesired = "STOPPED";

    // wait for engine state to be "STOPPED" before running stop hooks
    for (let i of whileGenerator()) {
      if (this.state !== "RUNNING") {
        break;
      }
      console.debug(`waiting for event loop to stop... (${i}ms elapsed)`);
      await this.sleep(1);
    }

    console.debug(`event loop stopped! running ${this.stopHooks.length} stop hooks...`);
    for (let i = 0; i < this.stopHooks.length; i++) {
      this.stopHooks[i]();
    }
    console.debug("flushing hooks...");
    this.flushHooks();
    console.debug("engine stopped");
  };

  /** gets called every frame (limited by `fpsLimit`) */
  async update() {
    // get ms delay for fps
    const delay = 1000 / this.fpsLimit;
    let totalFrames = 0;

    for (let i of whileGenerator()) {
      const deltaTimeStart = performance.now();
      totalFrames = i;
      if (this.stateDesired === "RUNNING") {
        this.state = "RUNNING";
        this.clearCanvas();
        this.ctx.save();
        this.draw();
        for (let i = 0; i < this.updateHooks.length; i++) {
          this.updateHooks[i]();
          // NOTE: for some reason, calling resetTransform here doesn't work
          // as expected, it needs to get called from the boid object to work
          // correctly
          // this.ctx.resetTransform();
          this.ctx.restore();
        }
        await this.sleep(delay);
      } else {
        console.debug("stopping event loop...");
        break;
      }
      const deltaTimeEnd = performance.now();
      this.deltaTime = deltaTimeEnd - deltaTimeStart;
      this.lastFrameTimestamp = deltaTimeStart;
    }

    this.state = "STOPPED";
    console.debug(`stopped event loop (${totalFrames} total frames)`);
  };

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  };

  draw() {
    if (this.fpsDisplay) {
      this.ctx.font = "20px serif";
      this.ctx.fillText(`${1000 / this.deltaTime}`, 10, 20);
    }
  }

  flushHooks() {
    this.startHooks = [];
    this.stopHooks = [];
    this.updateHooks = [];
  };

  /** adds a hook to be run when `start()` is called and *before* the event loop is running */
  addStartHook(hook: () => void) {
    console.debug("adding start hook...");
    this.startHooks.push(hook);
  };

  /** adds a hook to be run after `stop()` is called and the *after* event loop is halted */
  addStopHook(hook: () => void) {
    this.stopHooks.push(hook);
  };

  /** adds a hook to be run when `update()` is called */
  addUpdateHook(hook: () => void) {
    this.updateHooks.push(hook);
  };
}
