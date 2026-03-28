import { GAME_CONSTANTS, type TrafficInstance } from './constants';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastTime: number = 0;
  private playerX: number = 0; 
  private playerZ: number = 0;
  private speed: number = 0;
  private distance: number = 0;
  private trackLength: number = 0;
  private segments: any[] = [];
  private totalSegments: number = 5000;
  private isCrashed: boolean = false;
  private vehicle: string;
  private targetLane: number = 0; // 0: left, 1: right
  private onGameOver: (stats: { distance: number, score: number, nearMisses: number }) => void;
  private onWin: () => void;
  private traffic: TrafficInstance[] = [];
  private score: number = 0;
  private nearMisses: number = 0;
  private cityOffset: number = 0;
  private mountainOffset: number = 0;
  private gameStore: any = null;
  private boostTimer: number = 0;
  private pickups: { id: string, lane: number, z: number, active: boolean }[] = [];

  // Image assets for character
  private images: { [key: string]: HTMLImageElement } = {};
  private houseImages: HTMLImageElement[] = []; // Array to store all 21 house types
  private loadedAssets: number = 0;

  private animationId: number | null = null;
  private eventHandlers: { [key: string]: (e: any) => void } = {};
  private keys: { [key: string]: boolean } = {};
  private touchStartX: number | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    onGameOver: (stats: any) => void,
    onWin: () => void,
    vehicle: string,
    gameStore: any
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onGameOver = onGameOver;
    this.onWin = onWin;
    this.vehicle = vehicle || 'bike';
    this.gameStore = gameStore;

    this.initTrack();
    this.loadAssets();
    this.spawnInitialObjects();
    this.setupInput();
  }

  private loadAssets() {
    // 1. Core character and traffic assets
    const assets = {
      'bike': GAME_CONSTANTS.ASSETS.PLAYER_BIKE,
      'scooter': GAME_CONSTANTS.ASSETS.PLAYER_SCOOTER
    };

    Object.entries(assets).forEach(([key, src]) => {
      const absoluteSrc = src.startsWith('/') ? src : `/${src}`;
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0) {
          this.images[key] = img;
          this.loadedAssets++;
        }
      };
      img.onerror = () => {
        console.error(`❌ ${key} Asset FAILED: ${absoluteSrc}. Falling back to procedural.`);
        this.loadedAssets++;
      };
      img.src = absoluteSrc;
    });

    // 2. House assets (21 types)
    for (let i = 1; i <= 21; i++) {
        const typeStr = i.toString().padStart(2, '0');
        const src = `/assets/house/house_type${typeStr}.png`;
        const img = new Image();
        img.onload = () => {
            if (img.naturalWidth > 0) {
                this.houseImages.push(img);
            }
        };
        img.src = src;
    }
  }


  private initTrack() {
    this.segments = [];
    for (let i = 0; i < this.totalSegments; i++) {
        const isCity = i % 2000 < 1000;
        
        // Randomly place houses (approx 8% of segments)
        // Ensure no houses too close to each other
        let house = null;
        if (i % 8 === 0 && i > 20) {
            house = {
                type: Math.floor(Math.random() * 21), // Index in houseImages
                side: Math.random() > 0.5 ? 1 : -1, // Right or Left
                offset: 1.5 + Math.random() * 0.5 // Standardizing offset
            };
        }

        this.segments.push({
            index: i,
            p1: { world: { x: 0, y: 0, z: i * GAME_CONSTANTS.SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 } },
            p2: { world: { x: 0, y: 0, z: (i + 1) * GAME_CONSTANTS.SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 } },
            color: this.getSegmentColor(i),
            type: isCity ? 'city' : 'mountain',
            house: house
        });
    }
    this.trackLength = this.totalSegments * GAME_CONSTANTS.SEGMENT_LENGTH;
  }

  private getSegmentColor(index: number) {
    const isRumble = Math.floor(index / GAME_CONSTANTS.RUMBLE_LENGTH) % 2;
    return {
      road: '#222222',
      grass: index % 6 < 3 ? '#1a2e1a' : '#2d4a2d',
      rumble: isRumble ? '#ffffff' : '#004A99',
      lane: isRumble ? 'rgba(255,255,255,0.4)' : ''
    };
  }

  private setupInput() {
    this.eventHandlers.keydown = (e: KeyboardEvent) => {
      this.keys[e.key] = true;
      if (e.key === 'ArrowLeft') this.targetLane = 0;
      if (e.key === 'ArrowRight') this.targetLane = 1;
    };
    this.eventHandlers.keyup = (e: KeyboardEvent) => this.keys[e.key] = false;
    
    this.eventHandlers.touchstart = (e: TouchEvent) => {
      this.touchStartX = e.touches[0].clientX;
    };
    
    this.eventHandlers.touchend = (e: TouchEvent) => {
      if (this.touchStartX !== null) {
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - this.touchStartX;
        if (deltaX < -30) this.targetLane = 0;
        else if (deltaX > 30) this.targetLane = 1;
      }
      this.touchStartX = null;
    };

    window.addEventListener('keydown', this.eventHandlers.keydown);
    window.addEventListener('keyup', this.eventHandlers.keyup);
    this.canvas.addEventListener('touchstart', this.eventHandlers.touchstart);
    this.canvas.addEventListener('touchend', this.eventHandlers.touchend);
  }

  public update(dt: number) {
    if (this.isCrashed) return;

    // Dynamic Acceleration Logic (Frame-rate independent)
    const isAccelerating = this.keys['ArrowUp'] || this.touchStartX !== null;
    
    if (isAccelerating) {
      this.speed += GAME_CONSTANTS.ACCEL * (dt * 60);
    } else if (this.keys['ArrowDown']) {
      this.speed += GAME_CONSTANTS.BREAKING * (dt * 60);
    } else {
      // FORCE-START: Aggressive auto-cruising for visibility
      const minStartSpeed = 40; // High speed start to avoid "static" look
      if (this.speed < minStartSpeed) {
        this.speed = minStartSpeed; // Jumpstart
      } else {
        const cruisingSpeed = GAME_CONSTANTS.MAX_SPEED * 0.45;
        if (this.speed < cruisingSpeed) {
          this.speed += 0.8 * (dt * 60);
        } else {
          this.speed += GAME_CONSTANTS.DECEL * (dt * 60);
        }
      }
    }

    const targetX = this.targetLane === 0 ? -0.25 : 0.25;
    const lerpSpeed = 0.2; // Snappier
    this.playerX += (targetX - this.playerX) * lerpSpeed;

    // --- NITRO SPEED BOOST ---
    const isBoosted = this.boostTimer > 0;
    const currentMaxSpeed = isBoosted ? GAME_CONSTANTS.MAX_SPEED + 80 : GAME_CONSTANTS.MAX_SPEED;

    this.speed = Math.max(0, Math.min(currentMaxSpeed, this.speed));
    this.playerZ += this.speed * (dt * 60);
    this.distance = Math.floor(this.playerZ / 100);

    // Parallax
    const speedPct = this.speed / GAME_CONSTANTS.MAX_SPEED;
    this.cityOffset = (this.cityOffset + (0.05 * speedPct * dt)) % 1;
    this.mountainOffset = (this.mountainOffset + (0.02 * speedPct * dt)) % 1;

    // Win Check
    if (this.distance > 0 && this.distance % 5000 === 0 && Math.random() < 0.05) {
        this.onWin();
        return;
    }

    this.updateTraffic(dt);
    this.checkCollisions(); // Fixed: 0 arguments

    // NITRO TIMER
    if (this.boostTimer > 0) {
        this.boostTimer -= dt;
    }

    // Sync Stats to Store for HUD (Non-blocking)
    if (this.gameStore) {
        this.gameStore.getState().updateStats({
            distance: this.distance,
            score: this.score,
            nearMisses: this.nearMisses,
            speed: Math.floor(this.speed)
        });
    }

    // Loop
    if (this.playerZ >= this.trackLength) {
      this.playerZ -= this.trackLength;
      this.spawnInitialObjects();
    }
  }

  private updateTraffic(dt: number) {
    // 1. Move vehicles
    for (const car of this.traffic) {
        car.z += car.speed * dt;
    }

    // 2. ENDLESS FLOW LOGIC: 
    // Sort by Z to find the furthest vehicle
    const sorted = [...this.traffic].sort((a, b) => b.z - a.z);
    const furthestZ = sorted[0].z;

    for (const car of this.traffic) {
        // If car is too far behind player, teleport it AHEAD of the furthest car
        // This ensures the road NEVER feels empty, regardless of distance traveled.
        if (car.z < this.playerZ - 2000) {
            car.z = furthestZ + 2000 + (Math.random() * 3000);
            car.lane = Math.random() > 0.5 ? 1 : 0;
            car.speed = 60 + Math.random() * 40;
            // Break to avoid cascading the furthestZ in the same frame
            break; 
        }
        
        // Loop back if it gets too far ahead (precision safety)
        if (car.z > this.playerZ + 200000) {
            car.z -= 100000;
        }
    }
  }

  private checkCollisions() {
    const playerW = 0.25; 
    
    // 1. NPC COllisions
    for (const car of this.traffic) {
      if (Math.abs(car.z - this.playerZ) < 600) {
        const carX = car.lane === 0 ? -0.25 : 0.25;
        const sideDist = Math.abs(carX - this.playerX);
        const longDist = Math.abs(car.z - this.playerZ);

        if (sideDist < playerW && longDist < 180) {
          this.triggerCrash();
          return;
        }

        if (sideDist < GAME_CONSTANTS.NEAR_MISS_DISTANCE && longDist < 300 && !this.isCrashed) {
            if (this.speed > 50) {
                this.nearMisses++;
                this.score += 500;
            }
        }
      }
    }

    // 2. PICKUP COLLISIONS (Nitro)
    for (const p of this.pickups) {
        if (!p.active) continue;
        const pX = p.lane === 0 ? -0.25 : 0.25;
        const sideDist = Math.abs(pX - this.playerX);
        const longDist = Math.abs(p.z - this.playerZ);
        
        if (sideDist < 0.3 && longDist < 300) {
            p.active = false;
            this.boostTimer = 4.0; // 4 Seconds of adrenaline!
            this.score += 2000;
        }

        // Endless loop for pickups (Optimized for 1000m spacing)
        if (p.z < this.playerZ - 1000) {
            p.z = this.playerZ + 100000 + (Math.random() * 20000); 
            p.active = true;
        }
    }
  }

  private triggerCrash() {
    this.isCrashed = true;
    this.speed = 0;
    this.onGameOver({
      distance: this.distance,
      score: this.score,
      nearMisses: this.nearMisses
    });
  }

  private spawnInitialObjects() {
    this.traffic = [];
    this.pickups = []; // NITRO CRYSTALS
    const numCars = 40; 
    const vehicleColors = ['#00F0FF', '#FF0055', '#FFD700', '#7000FF', '#00FF41', '#FF6B00'];
    const minZ = 20000; 
    
    for (let i = 0; i < numCars; i++) {
        const typeRand = Math.random();
        this.traffic.push({
            id: `traffic-${i}`,
            lane: Math.random() > 0.5 ? 1 : 0,
            z: minZ + (i * 4500) + (Math.random() * 2000), 
            speed: 60 + Math.random() * 40,
            type: typeRand > 0.7 ? 'truck' : 'car',
            width: 0.8,
            length: 400,
            color: vehicleColors[Math.floor(Math.random() * vehicleColors.length)]
        });
    }

    // Spawn Nitro every 1000m (100,000 units)
    for (let i = 0; i < 5; i++) {
        this.pickups.push({
            id: `nitro-${i}`,
            lane: Math.random() > 0.5 ? 1 : 0,
            z: 100000 + (i * 100000), 
            active: true
        });
    }
  }

  public render() {
    const { ctx, canvas } = this;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render Cyber Sky (Dark Gradient) behind the high horizon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height / 4);
    skyGrad.addColorStop(0, '#000810');
    skyGrad.addColorStop(1, '#001A33');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const baseSegment = this.findSegment(this.playerZ);
    const cameraZ = this.playerZ;
    let maxy = canvas.height;

    for (let n = 0; n < GAME_CONSTANTS.DRAW_DISTANCE; n++) {
      const segment = this.segments[(baseSegment.index + n) % this.totalSegments];
      const looped = segment.index < baseSegment.index;
      const offsetZ = looped ? this.trackLength : 0;

      this.project(segment.p1, this.playerX * GAME_CONSTANTS.ROAD_WIDTH, GAME_CONSTANTS.CAMERA_HEIGHT, cameraZ - offsetZ);
      this.project(segment.p2, this.playerX * GAME_CONSTANTS.ROAD_WIDTH, GAME_CONSTANTS.CAMERA_HEIGHT, cameraZ - offsetZ);

      if (segment.p1.screen.z <= GAME_CONSTANTS.CAMERA_DEPTH || segment.p2.screen.y >= maxy) continue;

      this.renderSegment(segment);
      maxy = segment.p2.screen.y;
    }

    // Render Sprites (Houses + Traffic) back-to-front for correct depth
    for (let i = GAME_CONSTANTS.DRAW_DISTANCE - 1; i >= 0; i--) {
        const segment = this.segments[(baseSegment.index + i) % this.totalSegments];
        
        // 1. Render House if present
        if (segment.house && this.houseImages[segment.house.type]) {
            this.renderHouse(segment);
        }

        // 2. Render Traffic and Pickups
        for (const car of this.traffic) {
            const carSeg = this.findSegment(car.z);
            if (carSeg.index === segment.index) {
                this.renderTrafficSprite(car);
            }
        }

        for (const p of this.pickups) {
            if (!p.active) continue;
            const pSeg = this.findSegment(p.z);
            if (pSeg.index === segment.index) {
                this.renderNitro(p);
            }
        }
    }

    this.renderPlayerSprite();
  }

  private renderSegment(segment: any) {
    const { ctx } = this;
    const p1 = segment.p1.screen;
    const p2 = segment.p2.screen;

    // Grass/Terrain (Cyber Dark)
    ctx.fillStyle = segment.color.grass;
    ctx.fillRect(0, p2.y, this.canvas.width, p1.y - p2.y);

    // Procedural Neon Road
    ctx.fillStyle = '#111111'; // Dark metallic road
    this.drawPolygon(p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y);

    // Neon Boundaries (Rumble)
    const r1 = p1.w / 20;
    const r2 = p2.w / 20;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00F0FF';
    ctx.fillStyle = segment.color.rumble;
    this.drawPolygon(p1.x - p1.w - r1, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2, p2.y);
    this.drawPolygon(p1.x + p1.w + r1, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x + p2.w + r2, p2.y);
    ctx.shadowBlur = 0;

    // Moving Cyber Grid Lines (Horizontal)
    if (this.speed > 0) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Horizontal grid lines that "move"
        ctx.moveTo(p1.x - p1.w, p1.y);
        ctx.lineTo(p1.x + p1.w, p1.y);
        ctx.stroke();
    }

    // Lane Divider (Neon Glow)
    if (segment.color.lane) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00F0FF';
      ctx.fillStyle = '#00F0FF';
      const lanew1 = p1.w / 60;
      const lanew2 = p2.w / 60;
      
      const laneX1 = p1.x - p1.w + (p1.w * 2 * 1 / GAME_CONSTANTS.LANES);
      const laneX2 = p2.x - p2.w + (p2.w * 2 * 1 / GAME_CONSTANTS.LANES);
      this.drawPolygon(laneX1 - lanew1 / 2, p1.y, laneX1 + lanew1 / 2, p1.y, laneX2 + lanew2 / 2, p2.y, laneX2 - lanew2 / 2, p2.y);
      ctx.shadowBlur = 0;
    }
  }

  private renderTrafficSprite(car: TrafficInstance) {
    const { ctx } = this;
    const isTruck = car.type === 'truck';
    
    // 1. PROJECT REAR AND FRONT PLANE
    const cameraZ = this.playerZ;
    const cameraX = this.playerX * GAME_CONSTANTS.ROAD_WIDTH;
    const carXWorld = car.lane === 0 ? -GAME_CONSTANTS.LANE_WIDTH/2 : GAME_CONSTANTS.LANE_WIDTH/2;
    
    const p_back = { world: { x: carXWorld, y: 0, z: car.z }, screen: { x: 0, y: 0, w: 0, z: 0 } };
    const p_front = { world: { x: carXWorld, y: 0, z: car.z + (isTruck ? 1000 : 400) }, screen: { x: 0, y: 0, w: 0, z: 0 } };
    
    this.project(p_back, cameraX, GAME_CONSTANTS.CAMERA_HEIGHT, cameraZ);
    this.project(p_front, cameraX, GAME_CONSTANTS.CAMERA_HEIGHT, cameraZ);

    // SMARTER CLIPPING: Only hide when the ENTIRE car is behind the camera
    if (p_front.screen.z <= 0) return;

    // ALPHA FADE: Smoothly fade out as the car passes the player for an arcade 'ghost' effect
    let alpha = 1.0;
    const distToCamera = car.z - cameraZ;
    if (distToCamera < 800) {
        alpha = Math.max(0.1, distToCamera / 800); 
    }
    ctx.globalAlpha = alpha;

    const b = p_back.screen, f = p_front.screen;

    // --- High-Fidelity Silhouette Logic ---
    // REFINED: Smaller sizes to ensure lane-perfect fit and avoid cutting
    const bw = b.w * (isTruck ? 0.5 : 0.35); 
    const bh = bw * (isTruck ? 0.8 : 0.65); 
    const fw = f.w * (isTruck ? 0.5 : 0.35);
    const fh = fw * (isTruck ? 0.8 : 0.65);

    const bx1 = b.x - bw/2, bx2 = b.x + bw/2, by = b.y;
    const fx1 = f.x - fw/2, fx2 = f.x + fw/2, fy = f.y;

    // A. GROUND SHADOW (Strong & Soft)
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, bw/1.2, bh/8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();
    ctx.restore();

    // B. ORGANIC 3D BODY (Non-box silhouette)
    const bodyColor = car.color;
    const darkColor = this.adjustColor(bodyColor, -40);
    const lightColor = this.adjustColor(bodyColor, 20);

    ctx.save();
    
    // Draw Side Face (Curved)
    ctx.fillStyle = darkColor;
    if (b.x < this.canvas.width / 2) {
        // Right side
        this.drawPolygon(bx2, by - 5, bx2, by - bh, fx2, fy - fh, fx2, fy - 5);
    } else {
        // Left side
        this.drawPolygon(bx1, by - 5, bx1, by - bh, fx1, fy - fh, fx1, fy - 5);
    }

    // Rear Body (Rounded Corners)
    const r = bh * 0.2;
    ctx.fillStyle = bodyColor;
    this.drawRoundedRect(ctx, bx1, by - bh, bw, bh, r);

    // C. TAPERED CABIN (Curved Glass)
    const t_rW = bw * (isTruck ? 0.95 : 0.7);
    const t_fW = fw * (isTruck ? 0.95 : 0.7);
    const t_H = bh * (isTruck ? 1.1 : 0.8);
    
    const r_tx1 = b.x - t_rW/2, r_tx2 = b.x + t_rW/2, r_ty = by - bh - t_H;
    const f_tx1 = f.x - t_fW/2, f_tx2 = f.x + t_fW/2, f_ty = fy - fh - t_H;

    // Side Pillars
    ctx.fillStyle = this.adjustColor(bodyColor, -90);
    if (b.x < this.canvas.width / 2) {
        this.drawPolygon(bx2, by - bh, r_tx2, r_ty, f_tx2, f_ty, fx2, fy - fh);
    } else {
        this.drawPolygon(bx1, by - bh, r_tx1, r_ty, f_tx1, f_ty, fx1, fy - fh);
    }

    // Roof (Specular Glint)
    const roofGrad = ctx.createLinearGradient(r_tx1, r_ty, r_tx1, r_ty + t_H);
    roofGrad.addColorStop(0, lightColor);
    roofGrad.addColorStop(1, bodyColor);
    ctx.fillStyle = roofGrad;
    this.drawPolygon(r_tx1, r_ty, r_tx2, r_ty, f_tx2, f_ty, f_tx1, f_ty);

    // D. HIGH-TECH DETAILING
    // Windows
    ctx.fillStyle = '#0a0a14';
    this.drawRoundedRect(ctx, b.x - t_rW/2 + 5, by - bh - t_H + 5, t_rW - 10, t_H - 10, 5);
    
    // LED STRIP LIGHTS
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FF0000';
    ctx.fillStyle = '#FF0000';
    const lw = bw * 0.2, lh = bh * 0.15;
    ctx.fillRect(bx1 + bw * 0.1, by - bh * 0.85, lw, lh);
    ctx.fillRect(bx2 - bw * 0.1 - lw, by - bh * 0.85, lw, lh);
    ctx.restore();

    // Metallic Bumper
    ctx.fillStyle = '#222';
    ctx.fillRect(bx1, by - bh * 0.2, bw, bh * 0.2);
    
    // Specular Shine Overlay (The "Pro" touch)
    const shineGrad = ctx.createLinearGradient(bx1, by - bh - t_H, bx2, by - bh);
    shineGrad.addColorStop(0, 'rgba(255,255,255,0)');
    shineGrad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shineGrad;
    ctx.fillRect(bx1, by - bh - t_H, bw, bh + t_H);

    ctx.restore();
    ctx.globalAlpha = 1.0; 
  }

  private renderNitro(nitro: any) {
    const { ctx } = this;
    const cameraZ = this.playerZ;
    const cameraX = this.playerX * GAME_CONSTANTS.ROAD_WIDTH;
    const itemX = nitro.lane === 0 ? -500 : 500;

    const p = { world: { x: itemX, y: 0, z: nitro.z }, screen: { x: 0, y: 0, w: 0, z: 0 } };
    this.project(p, cameraX, GAME_CONSTANTS.CAMERA_HEIGHT, cameraZ);

    if (p.screen.z <= GAME_CONSTANTS.CAMERA_DEPTH) return;

    const { x, y, w } = p.screen;
    const size = w * 0.6;
    
    // CALMED DOWN GLOW: 1000ms instead of 100ms
    const glow = (Math.sin(Date.now() / 1000) + 1) / 2;

    ctx.save();
    ctx.translate(x, y);
    
    // Outer Glow
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00F0FF';
    
    // 3D Crystal Body
    const grad = ctx.createLinearGradient(0, -size, 0, 0);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.5, '#00F0FF');
    grad.addColorStop(1, '#001A33');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -size - (glow * 20));
    ctx.lineTo(-size/2, -size/2);
    ctx.lineTo(0, 0);
    ctx.lineTo(size/2, -size/2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  private adjustColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#',''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  private renderPlayerSprite() {
    const { ctx, canvas, images } = this;
    const isBike = this.vehicle === 'bike';
    const img = isBike ? images['bike'] : images['scooter'];
    
    // Animation for leaning and vibrating
    const shake = (this.speed / GAME_CONSTANTS.MAX_SPEED) * 4;
    const sx = (Math.random() - 0.5) * shake;
    const sy = (Math.random() - 0.5) * shake;
    const tilt = (this.playerX * 0.12); 
    const isBoosted = this.boostTimer > 0;

    // Nitro Jitter Effect
    const boostShake = isBoosted ? (Math.random() - 0.5) * 8 : 0;

    ctx.save();
    
    // Position refined to be 'further' into the road for realism
    const renderY = canvas.height - 180;

    // --- A. GROUND CONTACT SHADOW (Pro-Level Gradient) ---
    ctx.save();
    ctx.translate(canvas.width / 2 + sx, renderY + sy);
    const shadowGrad = ctx.createRadialGradient(0,0,0,0,0,100);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.scale(1, 0.3); 
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 150 + (this.speed/10), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- B. NITRO BLUE FIRE EFFECTS ---
    if (isBoosted) {
        ctx.save();
        ctx.translate(canvas.width / 2, renderY + 40);
        ctx.shadowBlur = 45;
        ctx.shadowColor = '#00F0FF';
        for(let i=0; i<8; i++) {
            ctx.fillStyle = `rgba(0, 240, 255, ${Math.random() * 0.7})`;
            const sw = 15 + Math.random() * 40;
            const sh = 100 + Math.random() * 250;
            ctx.fillRect((Math.random()-0.5) * 100, 0, sw, sh);
        }
        ctx.restore();
    }

    if (img && (img.complete && img.naturalWidth > 0)) {
        // --- HIGH-FIDELITY PNG (Scaled for better Road Depth) ---
        const scaleFactor = 0.42; 
        const w = 550 * scaleFactor;
        const h = w * (img.height / img.width);
        
        ctx.translate(canvas.width / 2 + sx + boostShake, renderY + sy + boostShake); 
        ctx.rotate(tilt);
        ctx.drawImage(img, -w / 2, -h + 20, w, h);
    } else {
        // --- VIBRANT FALLBACK ---
        const scaleFactor = 0.6;
        ctx.translate(canvas.width / 2 + sx, renderY - 40 + sy); 
        ctx.scale(scaleFactor, scaleFactor);
        ctx.rotate(tilt);

        // 1. Dual Exhausts / Rear Tire Area
        ctx.fillStyle = '#111';
        ctx.fillRect(-60, -80, 40, 80);
        ctx.fillRect(20, -80, 40, 80);

        // 2. High-Contrast Body (Yamaha Racing Blue)
        const gradient = ctx.createLinearGradient(0, -380, 0, -20);
        gradient.addColorStop(0, '#00F0FF'); // Neon Cyan top
        gradient.addColorStop(0.5, '#004A99'); // Yamaha Blue
        gradient.addColorStop(1, '#001A33'); // Dark base
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(-100, -20);
        ctx.lineTo(-130, -340);
        ctx.lineTo(130, -340);
        ctx.lineTo(100, -20);
        ctx.closePath();
        ctx.fill();

        // 3. Glowing Tail Light (Massive)
        ctx.shadowBlur = 50;
        ctx.shadowColor = '#FF0000';
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-70, -350, 140, 25); // Restored missing Statement
        ctx.shadowBlur = 0;
        
        // 4. Tech Highlights
        ctx.fillStyle = 'white';
        ctx.fillRect(-120, -300, 10, 40);
        ctx.fillRect(110, -300, 10, 40);
    }

    ctx.restore();
  }

  private project(p: any, cameraX: number, cameraY: number, cameraZ: number) {
    p.camera = { x: p.world.x - cameraX, y: p.world.y - cameraY, z: p.world.z - cameraZ };
    
    // CRITICAL FIX: Balanced Safe Projection Floor
    // Prevents 'exploding' size while allowing smooth passing visuals
    const safeZ = Math.max(50, p.camera.z); 
    const scale = GAME_CONSTANTS.CAMERA_DEPTH / safeZ;
    const horizonY = this.canvas.height / 10;
    
    p.screen = {
      x: Math.round((this.canvas.width / 2) + (scale * p.camera.x * this.canvas.width / 2)),
      y: Math.round(horizonY - (scale * p.camera.y * this.canvas.height / 2)),
      w: Math.round(scale * GAME_CONSTANTS.ROAD_WIDTH * this.canvas.width / 2),
      z: p.camera.z
    };
  }

  private renderHouse(segment: any) {
    const { ctx, houseImages } = this;
    const house = segment.house;
    const img = houseImages[house.type];
    const p = segment.p1.screen;
    // CRITICAL: Prevent house from 'lifting' when very close to camera
    if (segment.p1.world.z < this.playerZ + 50) return;
    const sideOffset = house.side * house.offset * p.w;
    const x = p.x + sideOffset;
    const y = p.y;
    
    // Scale house based on perspective
    const scale = p.w / GAME_CONSTANTS.ROAD_WIDTH;
    const houseScale = 35; // Balanced large house multiplier
    const houseW = img.width * scale * houseScale;
    const houseH = img.height * scale * houseScale;

    // Center pivot at bottom
    ctx.drawImage(
        img, 
        x - (house.side === 1 ? 0 : houseW), 
        y - houseH + 5, // Slightly "sink" it into the ground for better look
        houseW, 
        houseH
    );
  }

  private drawPolygon(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x3, y3);
    this.ctx.lineTo(x4, y4);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private findSegment(z: number) {
    const index = Math.floor(z / GAME_CONSTANTS.SEGMENT_LENGTH);
    return this.segments[(index % this.totalSegments + this.totalSegments) % this.totalSegments];
  }

  public loop = (time: number) => {
    if (!this.canvas) return;

    if (!this.lastTime) this.lastTime = time; 
    const dt = Math.min(0.1, (time - this.lastTime) / 1000);
    this.lastTime = time;
    
    this.update(dt);
    this.render();
    this.animationId = requestAnimationFrame(this.loop);
  }

  public start() {
    if (this.animationId) return;
    this.animationId = requestAnimationFrame(this.loop);
  }

  public stop() {
    if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    }
    
    // Remove all event listeners to prevent memory leaks
    window.removeEventListener('keydown', this.eventHandlers.keydown);
    window.removeEventListener('keyup', this.eventHandlers.keyup);
    this.canvas.removeEventListener('touchstart', this.eventHandlers.touchstart);
    this.canvas.removeEventListener('touchend', this.eventHandlers.touchend);
  }
}
