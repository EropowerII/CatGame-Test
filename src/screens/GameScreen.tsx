
import React, { useEffect, useRef, useState } from "react";
import { Episode } from "../systems/EpisodeManager";
import { Pathfinding, Point } from "../systems/Pathfinding";
import { ParticleSystem } from "../systems/ParticleSystem";
import { AnimationManager, CatState } from "../systems/AnimationManager";
import { POIHandler } from "../systems/POIHandler";
import { PuzzleHandler } from "../systems/PuzzleHandler";
import { ChevronLeft, Menu, Star } from "lucide-react";

interface GameScreenProps {
  episode: Episode;
  onExit: () => void;
}

class Cat {
  pos: Point;
  target: Point | null = null;
  speed: number = 3;
  state: CatState = CatState.IDLE;
  size: number = 64;
  path: Point[] = [];
  idleTimer: number = 0;

  constructor(x: number, y: number) {
    this.pos = { x, y };
  }

  update(pathfinding: Pathfinding, dt: number) {
    if (this.target || this.path.length > 0) {
      this.state = CatState.WALKING;
      this.idleTimer = 0;
      
      // If we don't have a path but have a target, find path
      if (this.path.length === 0 && this.target) {
        this.path = pathfinding.findPath(this.pos, this.target);
        this.target = null;
      }

      const nextPoint = this.path[0];
      if (!nextPoint) {
        this.state = CatState.IDLE;
        return;
      }

      const dx = nextPoint.x - this.pos.x;
      const dy = nextPoint.y - this.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.speed) {
        this.pos = { ...nextPoint };
        this.path.shift();
        if (this.path.length === 0) {
          this.state = CatState.IDLE;
        }
      } else {
        this.pos.x += (dx / dist) * this.speed;
        this.pos.y += (dy / dist) * this.speed;
      }
    } else {
       // Idle logic: transition to sleeping after 5 seconds of inactivity
       this.idleTimer += dt;
       if (this.idleTimer > 5000) {
         this.state = CatState.SLEEPING;
       } else {
         this.state = CatState.IDLE;
       }
    }
  }

  draw(ctx: CanvasRenderingContext2D, anim: AnimationManager) {
    // const frame = anim.getCurrentFrame(this.state);
    
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    
    // Character drawn with theme colors
    ctx.fillStyle = "#FF9F1C"; // brand-orange
    ctx.strokeStyle = "#E67E22"; // border
    ctx.lineWidth = 3;
    
    // Tail
    ctx.beginPath();
    ctx.moveTo(-25, 10);
    ctx.quadraticCurveTo(-40, 20, -35, 5);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Head
    ctx.beginPath();
    ctx.arc(22, -15, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Ears
    ctx.beginPath();
    ctx.moveTo(12, -25); ctx.lineTo(18, -40); ctx.lineTo(24, -25); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(26, -25); ctx.lineTo(32, -40); ctx.lineTo(38, -25); ctx.fill(); ctx.stroke();
    
    // Eyes
    if (this.state === CatState.SLEEPING) {
      // Closed eyes (curved lines)
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(25, -18, 5, 0.2, Math.PI - 0.2); ctx.stroke();
      ctx.beginPath(); ctx.arc(33, -18, 5, 0.2, Math.PI - 0.2); ctx.stroke();
      
      // Zzz particles (simplified for the placeholder)
      if (Math.random() > 0.95) {
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.fillText("Z", 40, -40);
      }
    } else {
      ctx.fillStyle = "black";
      ctx.beginPath(); ctx.arc(25, -18, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(33, -18, 3, 0, Math.PI*2); ctx.fill();
    }

    ctx.restore();
  }
}

export default function GameScreen({ episode, onExit }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Systems
  const particleSystem = useRef(new ParticleSystem());
  const pathfinding = useRef(new Pathfinding(1920, 1080, 30));
  const animManager = useRef(new AnimationManager());
  const poiHandler = useRef(new POIHandler());
  const puzzleHandler = useRef(new PuzzleHandler());
  
  const [cat] = useState(new Cat(300, 900));
  const [bgError, setBgError] = useState(false);
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    // Setup initial POIs and Obstacles
    if (episode.id === "1") {
      // Landscape coordinates for the living room image
      pathfinding.current.setObstacle(200, 600, 600, 300); // Sofa
      pathfinding.current.setObstacle(1100, 500, 400, 400); // Table/Chair area
      pathfinding.current.setObstacle(1600, 400, 300, 600); // Right side cabinet
      
      poiHandler.current.addPOI({
        id: "bowl",
        x: 400,
        y: 950,
        radius: 80,
        label: "Bowl",
        onInteract: () => {
          particleSystem.current.emit(400, 950, 40, "#FFD93D");
        }
      });

      poiHandler.current.addPOI({
        id: "window",
        x: 1650,
        y: 350,
        radius: 120,
        label: "Window",
        onInteract: () => {
          particleSystem.current.emit(1650, 350, 20, "rgba(255,255,255,0.8)");
        }
      });
    }

    const animate = (time: number) => {
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      update(dt);
      draw();
      
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [episode]);

  const update = (dt: number) => {
    cat.update(pathfinding.current, dt);
    particleSystem.current.update();
    animManager.current.update(dt, cat.state);

    if (Math.random() > 0.8) {
      particleSystem.current.emit(Math.random() * 1080, Math.random() * 1920, 1, "#FFD93D");
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particleSystem.current.draw(ctx);
    cat.draw(ctx, animManager.current);

    // Draw POI markers (Nodes)
    poiHandler.current.getPOIs().forEach(poi => {
      ctx.save();
      ctx.strokeStyle = "white";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(poi.x, poi.y, poi.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner pulsing node placeholder
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(poi.x, poi.y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = "#FF8E3C";
      ctx.fillRect(poi.x - 40, poi.y + poi.radius + 10, 80, 30);
      ctx.fillStyle = "white";
      ctx.font = "bold 20px Helvetica";
      ctx.textAlign = "center";
      ctx.fillText(poi.label, poi.x, poi.y + poi.radius + 32);
      ctx.restore();
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const poi = poiHandler.current.checkClick(x, y);
    if (poi) {
      cat.target = { x: poi.x, y: poi.y };
      poi.onInteract();
    } else {
      cat.target = { x, y };
    }

    particleSystem.current.emit(x, y, 15, "#FFD93D");
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-brand-amber flex items-center justify-center font-sans">
      {/* Top HUD */}
      <div className="absolute top-6 left-6 z-50 flex gap-4">
        <div className="bg-white rounded-full px-6 py-3 shadow-lg border-2 border-brand-orange flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">C</div>
          <span className="font-bold text-orange-900">Neko lvl. 1</span>
        </div>
        <div className="bg-white rounded-full px-6 py-3 shadow-lg border-2 border-brand-teal flex items-center gap-2">
          <Star className="text-brand-teal" size={20} fill="#4ECDC4" />
          <span className="font-bold text-teal-800">Happiness 92%</span>
        </div>
      </div>

      {/* Right Menu UI */}
      <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-3">
        <button 
           onClick={onExit}
           className="w-16 h-16 bg-white rounded-2xl border-4 border-brand-orange shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Menu className="text-brand-orange" size={32} />
        </button>
        <button className="w-16 h-16 bg-brand-orange rounded-2xl border-4 border-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform">
          <Star className="text-white" size={32} fill="white" />
        </button>
      </div>

      {/* Full Screen Game Stage */}
      <div className="absolute inset-0 w-full h-full bg-neutral-900 overflow-hidden flex items-center justify-center">
         {/* The Stage: maintains aspect ratio and covers the screen */}
         <div 
           className="relative aspect-video shadow-2xl flex items-center justify-center pointer-events-auto"
           style={{
             width: 'max(100vw, calc(100vh * (16 / 9)))',
             height: 'max(100vh, calc(100vw * (9 / 16)))',
           }}
         >
            {/* Background Image Layer */}
            <img 
              src={bgError ? "https://images.unsplash.com/photo-1513360371669-4ada4801c20c?auto=format&fit=crop&w=1920&q=80" : (episode.backgroundUrl || "https://images.unsplash.com/photo-1513360371669-4ada4801c20c?auto=format&fit=crop&w=1920&q=80")}
              onError={() => setBgError(true)}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              alt="background"
              referrerPolicy="no-referrer"
            />

            <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
              {/* Sunbeam effect spanning the full stage */}
              <div 
                className="absolute top-0 right-1/4 w-1/4 h-[150%] bg-gradient-to-b from-white/30 to-transparent"
                style={{ transform: 'rotate(-25deg)', transformOrigin: 'top right' }}
              />
            </div>

            <canvas
              ref={canvasRef}
              width={1920}
              height={1080}
              onClick={handleCanvasClick}
              className="relative z-10 w-full h-full cursor-crosshair bg-transparent"
            />
         </div>
      </div>
    </div>
  );
}
