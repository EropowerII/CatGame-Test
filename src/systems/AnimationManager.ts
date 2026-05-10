
export enum CatState {
  IDLE = "idle",
  WALKING = "walking",
  SLEEPING = "sleeping",
  PLAYING = "playing",
}

export interface AnimationFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class AnimationManager {
  private frames: Record<CatState, AnimationFrame[]> = {
    [CatState.IDLE]: [],
    [CatState.WALKING]: [],
    [CatState.SLEEPING]: [],
    [CatState.PLAYING]: [],
  };
  private currentFrameIndex = 0;
  private frameTimer = 0;
  private frameDuration = 120; // Slightly slower for better watercolor feel
  private sheets: Partial<Record<CatState, HTMLCanvasElement | HTMLImageElement>> = {};
  private paths: Partial<Record<CatState, string>> = {
    [CatState.WALKING]: `${import.meta.env.BASE_URL}Assets/Cat/Walk1.png`.replace("//", "/"),
    [CatState.IDLE]: `${import.meta.env.BASE_URL}Assets/Cat/Idle1.png`.replace("//", "/"),
  };

  constructor() {
    // Initial placeholders
    this.initDefaultFrames(128, 128);
  }

  private initDefaultFrames(frameW: number, frameH: number) {
    Object.values(CatState).forEach(state => {
      this.frames[state as CatState] = [{ x: 0, y: 0, width: frameW, height: frameH }];
    });
  }

  public async preload() {
    const promises = Object.entries(this.paths).map(([state, path]) => 
      this.preloadSheet(state as CatState, path!)
    );
    await Promise.all(promises);
  }

  private async preloadSheet(state: CatState, path: string) {
    return new Promise<void>((resolve) => {
      const img = new Image();
      // Use relative paths to be compatible with GitHub Pages / subpaths
      img.src = path;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (img.naturalWidth > 0) {
          console.log(`Cat sprite sheet loaded for state ${state}: ${path} (${img.naturalWidth}x${img.naturalHeight})`);
          const processed = this.processSpriteSheet(img);
          this.sheets[state] = processed;

          const aspect = img.naturalWidth / img.naturalHeight;
          let frameCount = 1;
          if (aspect > 2.5) frameCount = 4;
          
          const frameW = Math.floor(img.naturalWidth / frameCount);
          const frameH = img.naturalHeight;

          this.frames[state] = [];
          for (let i = 0; i < frameCount; i++) {
            this.frames[state].push({ x: i * frameW, y: 0, width: frameW, height: frameH });
          }
          
          // If we just loaded IDLE, also apply it to SLEEPING and PLAYING as fallback
          if (state === CatState.IDLE) {
            this.frames[CatState.SLEEPING] = [...this.frames[CatState.IDLE]];
            this.frames[CatState.PLAYING] = [...this.frames[CatState.IDLE]];
            this.sheets[CatState.SLEEPING] = processed;
            this.sheets[CatState.PLAYING] = processed;
          }
        }
        resolve();
      };
      img.onerror = () => {
        console.warn(`Failed to load sprite at ${path}`);
        resolve();
      };
    });
  }

  private processSpriteSheet(img: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  public getSpriteSheet(state: CatState) {
    const sheet = this.sheets[state] || this.sheets[CatState.IDLE] || this.sheets[CatState.WALKING];
    return sheet || null;
  }

  public getFrames(state: CatState) {
    return this.frames[state] || this.frames[CatState.IDLE];
  }

  public update(deltaTime: number, state: CatState) {
    this.frameTimer += deltaTime;
    const stateFrames = this.getFrames(state);
    if (this.frameTimer >= this.frameDuration && stateFrames.length > 0) {
      this.frameTimer = 0;
      this.currentFrameIndex = (this.currentFrameIndex + 1) % stateFrames.length;
    }
  }

  public getCurrentFrame(state: CatState): AnimationFrame {
    const stateFrames = this.getFrames(state);
    return stateFrames[this.currentFrameIndex % stateFrames.length];
  }
}
