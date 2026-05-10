
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
  private frameDuration = 100; // ms per frame

  constructor() {
    // Define frames (placeholders for now)
    for (let i = 0; i < 4; i++) {
       this.frames[CatState.IDLE].push({ x: i * 64, y: 0, width: 64, height: 64 });
       this.frames[CatState.WALKING].push({ x: i * 64, y: 64, width: 64, height: 64 });
       this.frames[CatState.SLEEPING].push({ x: i * 64, y: 128, width: 64, height: 64 });
       this.frames[CatState.PLAYING].push({ x: i * 64, y: 192, width: 64, height: 64 });
    }
  }

  public update(deltaTime: number, state: CatState) {
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer = 0;
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames[state].length;
    }
  }

  public getCurrentFrame(state: CatState): AnimationFrame {
    return this.frames[state][this.currentFrameIndex];
  }
}
