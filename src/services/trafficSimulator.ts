/**
 * High-definition synthetic traffic simulator for testing the radar system.
 * Generates realistic moving vehicles across lanes at various calibrated speeds.
 */

import { VehicleCategory } from '../types/radar';

export interface SimCar {
  id: string;
  category: VehicleCategory;
  colorName: string;
  colorHex: string;
  width: number;
  length: number;
  lane: number;
  x: number; // 0 to 1
  y: number; // 0 to 1
  targetSpeedKmH: number;
  currentSpeedKmH: number;
  plate: string;
  direction: 'left-to-right' | 'right-to-left';
}

const CATEGORIES: { category: VehicleCategory; widthRatio: number; lengthRatio: number; weight: number }[] = [
  { category: 'Citadine', widthRatio: 36, lengthRatio: 64, weight: 3 },
  { category: 'Berline', widthRatio: 40, lengthRatio: 82, weight: 4 },
  { category: 'SUV', widthRatio: 44, lengthRatio: 88, weight: 3 },
  { category: 'Fourgon', widthRatio: 46, lengthRatio: 104, weight: 2 },
  { category: 'Sportive', widthRatio: 42, lengthRatio: 80, weight: 1 },
  { category: 'Poids Lourd', widthRatio: 52, lengthRatio: 140, weight: 1 },
];

const COLORS = [
  { name: 'Noir Obsidienne', hex: '#1e2024' },
  { name: 'Gris Métallisé', hex: '#64748b' },
  { name: 'Blanc Nacré', hex: '#e2e8f0' },
  { name: 'Rouge Saphir', hex: '#dc2626' },
  { name: 'Bleu Minuit', hex: '#1e3a8a' },
  { name: 'Argent Lunaire', hex: '#94a3b8' },
  { name: 'Jaune Sport', hex: '#eab308' },
];

const SPEED_PROFILES = [45, 50, 64, 76, 88, 94];

export class TrafficSimulator {
  private cars: SimCar[] = [];
  private lastSpawnTime: number = 0;
  private carCounter: number = 100;

  constructor() {
    this.initInitialCars();
  }

  private initInitialCars() {
    this.cars = [];
    this.spawnCar(-0.1, 0, 48);
    this.spawnCar(0.4, 0, 50);
    this.spawnCar(1.1, 1, 74);
  }

  public spawnCar(startX?: number, forcedLane?: number, forcedSpeed?: number) {
    this.carCounter++;
    const lane = forcedLane !== undefined ? forcedLane : Math.random() > 0.5 ? 1 : 0;
    const direction: 'left-to-right' | 'right-to-left' = lane === 0 ? 'left-to-right' : 'right-to-left';

    const catObj = CATEGORIES[this.carCounter % CATEGORIES.length];
    const colObj = COLORS[this.carCounter % COLORS.length];

    // Standard calibrated physical speeds (no random decimals)
    const speed = forcedSpeed !== undefined ? forcedSpeed : SPEED_PROFILES[this.carCounter % SPEED_PROFILES.length];

    const x = startX !== undefined ? startX : (direction === 'left-to-right' ? -0.2 : 1.2);

    this.cars.push({
      id: `VEH-${this.carCounter}`,
      category: catObj.category,
      colorName: colObj.name,
      colorHex: colObj.hex,
      width: catObj.widthRatio,
      length: catObj.lengthRatio,
      lane,
      x,
      y: lane === 0 ? 0.38 : 0.62,
      targetSpeedKmH: speed,
      currentSpeedKmH: speed,
      plate: `CONTROLE-V${this.carCounter}`,
      direction,
    });
  }

  public update(
    deltaTimeSeconds: number,
    speedLimit: number,
    gateDistanceMeters: number = 10,
    gateSpanFraction: number = 0.36
  ) {
    const now = Date.now();
    // Spawn new car periodically if less than 5 cars on road
    if (now - this.lastSpawnTime > 2600 && this.cars.length < 4) {
      this.spawnCar();
      this.lastSpawnTime = now;
    }

    // Calibrated physics: screen meters scale matches exactly the gate distance
    const screenMeters = Math.max(15, gateDistanceMeters / Math.max(0.1, gateSpanFraction));

    // Update cars
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      const speedMs = car.currentSpeedKmH / 3.6;
      const screenDelta = (speedMs / screenMeters) * deltaTimeSeconds;

      if (car.direction === 'left-to-right') {
        car.x += screenDelta;
        if (car.x > 1.3) {
          this.cars.splice(i, 1);
        }
      } else {
        car.x -= screenDelta;
        if (car.x < -0.3) {
          this.cars.splice(i, 1);
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // 1. Draw asphalt road background
    ctx.fillStyle = '#1e242d';
    ctx.fillRect(0, 0, width, height);

    // Road grain texture simulation
    ctx.fillStyle = '#262d38';
    ctx.fillRect(0, height * 0.22, width, height * 0.56);

    // Sidewalk curb top
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, height * 0.20, width, height * 0.02);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, height * 0.22, width, 4);

    // Sidewalk curb bottom
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, height * 0.78, width, height * 0.02);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, height * 0.78 - 4, width, 4);

    // Road edge solid white lines
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.25);
    ctx.lineTo(width, height * 0.25);
    ctx.moveTo(0, height * 0.75);
    ctx.lineTo(width, height * 0.75);
    ctx.stroke();

    // Road center broken white lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.setLineDash([28, 20]);
    ctx.lineDashOffset = 0;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // 2. Draw moving vehicles
    for (const car of this.cars) {
      const screenX = car.x * width;
      const screenY = car.y * height;
      const carW = car.length * (width / 900); // oriented horizontally along road
      const carH = car.width * (height / 500);

      ctx.save();
      ctx.translate(screenX, screenY);

      // Car drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.roundRect(-carW / 2 + 4, -carH / 2 + 5, carW, carH, 8);
      ctx.fill();

      // Main car body
      ctx.fillStyle = car.colorHex;
      ctx.beginPath();
      ctx.roundRect(-carW / 2, -carH / 2, carW, carH, 6);
      ctx.fill();

      // Metallic highlight / border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const isRight = car.direction === 'left-to-right';
      const frontOffset = isRight ? carW * 0.35 : -carW * 0.35;
      const rearOffset = isRight ? -carW * 0.38 : carW * 0.38;

      // Windshield & roof
      ctx.fillStyle = '#0f172a';
      const roofW = carW * 0.48;
      const roofH = carH * 0.75;
      ctx.beginPath();
      ctx.roundRect(-roofW / 2, -roofH / 2, roofW, roofH, 4);
      ctx.fill();

      // Windshield glass reflection
      ctx.fillStyle = '#38bdf8';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(isRight ? carW * 0.08 : -carW * 0.16, -roofH * 0.42, carW * 0.08, roofH * 0.84);
      ctx.globalAlpha = 1.0;

      // Headlights (front)
      ctx.fillStyle = '#fef08a';
      const headX = frontOffset;
      ctx.fillRect(headX, -carH * 0.44, 4, 7);
      ctx.fillRect(headX, carH * 0.44 - 7, 4, 7);

      // Headlight light cone
      const grad = ctx.createLinearGradient(headX, 0, headX + (isRight ? 90 : -90), 0);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
      grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(headX, -carH * 0.45);
      ctx.lineTo(headX + (isRight ? 90 : -90), -carH * 0.9);
      ctx.lineTo(headX + (isRight ? 90 : -90), carH * 0.9);
      ctx.lineTo(headX, carH * 0.45);
      ctx.closePath();
      ctx.fill();

      // Taillights (rear)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(rearOffset, -carH * 0.42, 3, 6);
      ctx.fillRect(rearOffset, carH * 0.42 - 6, 3, 6);

      // License plate tag on bumper
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(frontOffset - (isRight ? 1 : 4), -8, 5, 16);
      ctx.fillRect(rearOffset - (isRight ? 4 : 1), -8, 5, 16);

      ctx.restore();
    }
  }

  public getCars(): SimCar[] {
    return this.cars;
  }
}
