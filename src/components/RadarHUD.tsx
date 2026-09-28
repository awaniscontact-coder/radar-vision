import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Eye, Sliders, AlertTriangle, Video, Maximize2, Zap, Upload } from 'lucide-react';
import { RadarConfig, VehicleTrack, SpeedInfraction } from '../types/radar';
import { RadarEngine, OpticalDetectionResult } from '../services/radarEngine';
import { TrafficSimulator } from '../services/trafficSimulator';

interface RadarHUDProps {
  config: RadarConfig;
  onUpdateConfig: (updater: (prev: RadarConfig) => RadarConfig) => void;
  onInfraction: (infraction: SpeedInfraction) => void;
  onSpeedUpdate: (currentSpeed: number, tracks: VehicleTrack[]) => void;
  activeTargetSpeed: number;
  onOpenGuide?: () => void;
}

export const RadarHUD: React.FC<RadarHUDProps> = ({
  config,
  onUpdateConfig,
  onInfraction,
  onSpeedUpdate,
  onOpenGuide,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [isOverspeedPulsing, setIsOverspeedPulsing] = useState<boolean>(false);
  const overspeedDecayTimerRef = useRef<number | null>(null);
  const [showGateControls, setShowGateControls] = useState<boolean>(false);
  const [currentFps, setCurrentFps] = useState<number>(60);
  const [activeVehiclesCount, setActiveVehiclesCount] = useState<number>(0);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

  // Dragging state for Gate 1 and Gate 2
  const [draggingGate, setDraggingGate] = useState<'gate1' | 'gate2' | null>(null);

  // Simulation & Engine instances
  const simRef = useRef<TrafficSimulator>(new TrafficSimulator());
  const engineRef = useRef<RadarEngine>(new RadarEngine(config, onInfraction));

  // Sync engine config
  useEffect(() => {
    engineRef.current.updateConfig(config);
    engineRef.current.setOnInfraction((inf) => {
      onInfraction(inf);
      setIsOverspeedPulsing(true);
      if (overspeedDecayTimerRef.current) clearTimeout(overspeedDecayTimerRef.current);
      overspeedDecayTimerRef.current = window.setTimeout(() => {
        setIsOverspeedPulsing(false);
      }, 2400);

      if (config.flashEffect) {
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 200);
      }
    });
  }, [config, onInfraction]);

  // Enumerate cameras
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoDevs = devices.filter((d) => d.kind === 'videoinput');
          setAvailableCameras(videoDevs);
        })
        .catch(() => {});
    }
  }, []);

  // Camera stream handler
  const startCamera = useCallback(async (deviceId?: string) => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Accès caméra refusé ou non supporté';
      setCameraError(message);
      setIsCameraActive(false);
      onUpdateConfig((c) => ({ ...c, activeSource: 'simulation' }));
    }
  }, [onUpdateConfig]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Source selection effect
  useEffect(() => {
    if (config.activeSource === 'camera') {
      startCamera(config.selectedCameraId);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [config.activeSource, config.selectedCameraId, startCamera, stopCamera]);

  // Handle direct pointer interaction on canvas for moving gate lines
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const isHorizontal = config.orientation === 'horizontal';
    const currentCoord = isHorizontal ? (clientX / rect.width) * canvas.width : (clientY / rect.height) * canvas.height;
    const totalDim = isHorizontal ? canvas.width : canvas.height;

    const g1 = config.gate1Pos * totalDim;
    const g2 = config.gate2Pos * totalDim;

    const threshold = 35;
    if (Math.abs(currentCoord - g1) < threshold) {
      setDraggingGate('gate1');
      canvas.setPointerCapture(e.pointerId);
    } else if (Math.abs(currentCoord - g2) < threshold) {
      setDraggingGate('gate2');
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingGate) return;
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const isHorizontal = config.orientation === 'horizontal';
    const rawPos = isHorizontal ? (e.clientX - rect.left) / rect.width : (e.clientY - rect.top) / rect.height;
    const clamped = Math.max(0.08, Math.min(0.92, rawPos));

    if (draggingGate === 'gate1') {
      onUpdateConfig((c) => ({ ...c, gate1Pos: Math.min(c.gate2Pos - 0.08, clamped) }));
    } else if (draggingGate === 'gate2') {
      onUpdateConfig((c) => ({ ...c, gate2Pos: Math.max(c.gate1Pos + 0.08, clamped) }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggingGate) {
      try {
        displayCanvasRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setDraggingGate(null);
    }
  };

  // Main Animation & Processing Loop (60 FPS)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaTime = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const canvas = displayCanvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;

      // 1. Render Video Source
      if (config.activeSource === 'camera' || config.activeSource === 'video_file') {
        const video = videoRef.current;
        if (video && video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, w, h);
        } else {
          ctx.fillStyle = '#090a0f';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#64748b';
          ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Initialisation du capteur optique...', w / 2, h / 2);
          ctx.textAlign = 'start';
        }
      } else {
        const gateSpan = Math.abs(config.gate2Pos - config.gate1Pos);
        simRef.current.update(deltaTime, config.speedLimit, config.gateDistanceMeters, gateSpan);
        simRef.current.render(ctx, w, h);
      }

      // 2. Optical Filtering
      applyHudVisualFilters(ctx, w, h, config.hudMode);

      // 3. Process Computer Vision Speed Tracking
      let result: OpticalDetectionResult;
      if (config.activeSource === 'camera' || config.activeSource === 'video_file') {
        const video = videoRef.current;
        const analysisCanvas = analysisCanvasRef.current;
        if (video && video.readyState >= 2 && analysisCanvas) {
          result = engineRef.current.processVideoFrame(video, analysisCanvas, canvas);
        } else {
          result = {
            tracks: [],
            highestSpeed: 0,
            activeOverspeedCount: 0,
            gate1X: config.gate1Pos * w,
            gate2X: config.gate2Pos * w,
            gate1Y: 0,
            gate2Y: 0,
            fps: 60,
            activeMethod: config.measurementMethod || 'kalman_ground_plane',
          };
        }
      } else {
        result = engineRef.current.processSimulatedFrame(simRef.current.getCars(), w, h, canvas);
      }

      setCurrentFps(result.fps);
      setActiveVehiclesCount(result.tracks.length);
      onSpeedUpdate(result.highestSpeed, result.tracks);

      // Trigger elegant red pulsation if any detected vehicle exceeds limit
      const hasLiveOverspeed =
        result.activeOverspeedCount > 0 ||
        (result.highestSpeed > config.speedLimit && result.highestSpeed > 0);

      if (hasLiveOverspeed) {
        setIsOverspeedPulsing(true);
        if (overspeedDecayTimerRef.current) clearTimeout(overspeedDecayTimerRef.current);
        overspeedDecayTimerRef.current = window.setTimeout(() => {
          setIsOverspeedPulsing(false);
        }, 1200);
      }

      // 4. Render HUD Overlay: Clean Laser Gates, Reticles, Minimalist Labels
      renderHudOverlays(ctx, w, h, config, result, currentTime);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [config, onSpeedUpdate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && videoRef.current) {
      stopCamera();
      const url = URL.createObjectURL(file);
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      videoRef.current.loop = true;
      videoRef.current.play().then(() => {
        onUpdateConfig((c) => ({ ...c, activeSource: 'video_file' }));
      });
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="space-y-3">
      {/* Sleek Top Control Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-2xl backdrop-blur-md">
        {/* Source Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onUpdateConfig((c) => ({ ...c, activeSource: 'camera' }))}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              config.activeSource === 'camera'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Caméra</span>
          </button>

          <button
            onClick={() => onUpdateConfig((c) => ({ ...c, activeSource: 'simulation' }))}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              config.activeSource === 'simulation'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulation</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              config.activeSource === 'video_file'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Fichier</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/*"
            className="hidden"
          />
        </div>

        {/* System Selector Segmented Control */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 px-2 tracking-wider">
            Système :
          </span>
          <button
            onClick={() => onUpdateConfig((c) => ({ ...c, measurementMethod: 'kalman_ground_plane' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
              (config.measurementMethod || 'kalman_ground_plane') === 'kalman_ground_plane' ||
              config.measurementMethod === 'trajectory_regression' ||
              config.measurementMethod === 'stadiametric'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kalman Sol
          </button>
          <button
            onClick={() => onUpdateConfig((c) => ({ ...c, measurementMethod: 'subpixel_optical_barrier' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
              config.measurementMethod === 'subpixel_optical_barrier' || config.measurementMethod === 'dual_gate'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sub-Pixel
          </button>
          <button
            onClick={() => onUpdateConfig((c) => ({ ...c, measurementMethod: 'optical_flow_vector' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
              config.measurementMethod === 'optical_flow_vector'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Flux LK
          </button>
        </div>

        {/* Right Tools: Filter Mode, Calibration, Fullscreen */}
        <div className="flex items-center gap-1.5">
          {/* Vision filter */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onUpdateConfig((c) => ({ ...c, hudMode: 'normal' }))}
              className={`px-2 py-1 text-xs rounded-lg transition cursor-pointer ${
                config.hudMode === 'normal' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Vision Normale"
            >
              Normal
            </button>
            <button
              onClick={() => onUpdateConfig((c) => ({ ...c, hudMode: 'night_vision' }))}
              className={`px-2 py-1 text-xs rounded-lg transition cursor-pointer flex items-center gap-1 ${
                config.hudMode === 'night_vision' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Vision Nocturne"
            >
              <Eye className="w-3 h-3" />
              <span>Nuit</span>
            </button>
          </div>

          {/* Gate calibration drawer toggle */}
          <button
            onClick={() => setShowGateControls(!showGateControls)}
            className={`p-2 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              showGateControls
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Ajuster les portes optiques"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Étalonnage</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Plein Écran"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        ref={containerRef}
        className={`relative w-full aspect-video max-h-[720px] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl select-none transition-all duration-300 ${
          isOverspeedPulsing
            ? 'border-2 border-rose-500 ring-4 ring-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.35)]'
            : 'border border-slate-800'
        }`}
      >
        <video ref={videoRef} playsInline muted className="hidden" crossOrigin="anonymous" />
        <canvas ref={analysisCanvasRef} width={320} height={180} className="hidden" />

        {/* Main Display Canvas */}
        <canvas
          ref={displayCanvasRef}
          width={1280}
          height={720}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full object-contain block bg-slate-950 cursor-crosshair touch-none"
        />

        {/* Quiet Clean Top-Left Telemetry Tag */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono-numbers text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-semibold">EN SERVICE</span>
            <span className="text-slate-600">·</span>
            <span>{currentFps} FPS</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400">{activeVehiclesCount} {activeVehiclesCount > 1 ? 'cibles' : 'cible'}</span>
          </div>
        </div>

        {/* Refined Crimson Overspeed Pill (No clownish bouncing banners!) */}
        {isOverspeedPulsing && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none transition-opacity duration-200">
            <div className="bg-rose-600/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 border border-rose-400/50">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Excès de Vitesse Détecté</span>
            </div>
          </div>
        )}

        {/* Refined Camera Flash Strobe */}
        {flashActive && (
          <div className="absolute inset-0 bg-white/75 pointer-events-none z-50 transition-opacity duration-150" />
        )}

        {/* Camera Access Error Message */}
        {cameraError && config.activeSource === 'camera' && (
          <div className="absolute top-4 left-4 right-4 bg-rose-950/90 border border-rose-700/80 rounded-xl p-3.5 text-rose-200 text-xs flex items-center justify-between z-30 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Impossible d'accéder à la caméra : {cameraError}.</span>
            </div>
            <button
              onClick={() => onUpdateConfig((c) => ({ ...c, activeSource: 'simulation' }))}
              className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg transition text-xs font-medium cursor-pointer"
            >
              Passer en Mode Simulation
            </button>
          </div>
        )}

        {/* Elegant Slide-In Calibration Drawer */}
        {showGateControls && (
          <div className="absolute top-4 right-4 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-5 rounded-2xl shadow-2xl z-30 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-bold text-white text-sm block">Étalonnage Métrologique</span>
                <span className="text-[11px] text-slate-400">Distance et position des repères</span>
              </div>
              <span className="text-cyan-400 font-bold font-mono-numbers">{config.gateDistanceMeters} m</span>
            </div>

            {/* Quick 1-Click Distance Presets */}
            <div>
              <label className="text-slate-300 font-medium block mb-1.5 text-[11px]">
                Préréglages de distance rapide :
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '10 m', val: 10 },
                  { label: '15 m', val: 15 },
                  { label: '25 m', val: 25 },
                  { label: '50 m', val: 50 },
                ].map((p) => (
                  <button
                    key={p.val}
                    onClick={() => onUpdateConfig((c) => ({ ...c, gateDistanceMeters: p.val }))}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      config.gateDistanceMeters === p.val
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Distance Slider */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Distance exacte Sol A-B :</span>
                <span className="font-bold font-mono-numbers text-cyan-400">{config.gateDistanceMeters} m</span>
              </div>
              <input
                type="range"
                min={2}
                max={60}
                step={0.5}
                value={config.gateDistanceMeters}
                onChange={(e) =>
                  onUpdateConfig((c) => ({ ...c, gateDistanceMeters: Math.max(1, Number(e.target.value)) }))
                }
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Camera angle slider */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Angle de visée caméra :</span>
                <span className="font-bold font-mono-numbers text-amber-400">{config.cameraAngleDegrees ?? 0}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={config.cameraAngleDegrees ?? 0}
                onChange={(e) =>
                  onUpdateConfig((c) => ({ ...c, cameraAngleDegrees: Number(e.target.value) }))
                }
                className="w-full accent-amber-400"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Correction cosinus appliquée automatiquement.
              </span>
            </div>

            {/* Drawer Footer */}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">
                  Glissez les lignes A et B sur la vidéo.
                </span>
                <button
                  onClick={() => setShowGateControls(false)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition cursor-pointer text-xs"
                >
                  Fermer
                </button>
              </div>

              {onOpenGuide && (
                <button
                  onClick={() => {
                    setShowGateControls(false);
                    onOpenGuide();
                  }}
                  className="text-left text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition cursor-pointer flex items-center gap-1"
                >
                  <span>Consulter le guide de positionnement & repères au sol →</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// HUD CANVAS OVERLAYS: MINIMALIST, HIGH-PRECISION, AND UNCLUTTERED
// =========================================================================

function applyHudVisualFilters(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mode: 'normal' | 'night_vision' | 'motion_mask'
) {
  if (mode === 'night_vision') {
    ctx.fillStyle = 'rgba(6, 78, 59, 0.22)';
    ctx.fillRect(0, 0, w, h);
  } else if (mode === 'motion_mask') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.fillRect(0, 0, w, h);
  }
}

function renderHudOverlays(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: RadarConfig,
  result: OpticalDetectionResult,
  currentTime: number
) {
  const isHorizontal = config.orientation === 'horizontal';
  const g1 = (config.gate1Pos ?? 0.32) * (isHorizontal ? w : h);
  const g2 = (config.gate2Pos ?? 0.68) * (isHorizontal ? w : h);
  const distMeters = config.gateDistanceMeters ?? 10;

  // 1. Draw Clean Thin Laser Gates
  drawMinimalLaserGate(ctx, g1, isHorizontal, w, h, 'Porte A', '#38bdf8');
  drawMinimalLaserGate(ctx, g2, isHorizontal, w, h, `Porte B (${distMeters} m)`, '#06b6d4');

  // 2. Draw Distance Span Indicator between Gates
  drawGateSpanBracket(ctx, g1, g2, isHorizontal, w, h, distMeters);

  // 3. Draw Vehicle Tracking Reticles
  for (const track of result.tracks) {
    drawMinimalVehicleTrack(ctx, track, config.speedLimit);
  }
}

function drawMinimalLaserGate(
  ctx: CanvasRenderingContext2D,
  coord: number,
  isHorizontal: boolean,
  w: number,
  h: number,
  label: string,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  if (isHorizontal) {
    ctx.moveTo(coord, 0);
    ctx.lineTo(coord, h);
  } else {
    ctx.moveTo(0, coord);
    ctx.lineTo(w, coord);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Clean, subtle tag at top
  const tagW = 90;
  const tagH = 20;
  const tagX = isHorizontal ? coord - tagW / 2 : 24;
  const tagY = isHorizontal ? 24 : coord - tagH / 2;

  ctx.fillStyle = 'rgba(9, 10, 15, 0.85)';
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagW, tagH, 4);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagW, tagH, 4);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, tagX + tagW / 2, tagY + 14);

  // Clean Circular Drag Handle at the Bottom
  const handleX = isHorizontal ? coord : w - 24;
  const handleY = isHorizontal ? h - 28 : coord;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(handleX, handleY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawGateSpanBracket(
  ctx: CanvasRenderingContext2D,
  g1: number,
  g2: number,
  isHorizontal: boolean,
  w: number,
  h: number,
  distMeters: number
) {
  ctx.save();
  const minG = Math.min(g1, g2);
  const maxG = Math.max(g1, g2);
  const midG = (minG + maxG) / 2;

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 3]);

  if (isHorizontal) {
    const yLine = h - 28;
    ctx.beginPath();
    ctx.moveTo(minG, yLine);
    ctx.lineTo(maxG, yLine);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(9, 10, 15, 0.8)';
    ctx.roundRect(midG - 35, yLine - 10, 70, 20, 4);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`↔ ${distMeters} m`, midG, yLine + 4);
  }
  ctx.restore();
}

function drawMinimalVehicleTrack(
  ctx: CanvasRenderingContext2D,
  track: VehicleTrack,
  limit: number
) {
  const { x, y, width, height } = track.bbox;
  const isOverspeed = track.status === 'overspeed';
  const isWarning = track.status === 'warning';

  // Crisp modern colors
  const themeColor = isOverspeed ? '#f43f5e' : isWarning ? '#fbbf24' : '#10b981';

  ctx.save();

  // 1. Sleek Corner Brackets (Thin 2px with clean gap)
  const len = Math.min(14, width * 0.22);
  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x, y + len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + len, y);

  ctx.moveTo(x + width - len, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + len);

  ctx.moveTo(x, y + height - len);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + len, y + height);

  ctx.moveTo(x + width - len, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width, y + height - len);
  ctx.stroke();

  // 2. Rigid Invariant Front Bumper Dot
  const lex = track.leadingEdge ? track.leadingEdge.x : track.centroid.x;
  const ley = track.leadingEdge ? track.leadingEdge.y : track.centroid.y;
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(lex, ley, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 3. Compact Floating Speed Chip (Clean, Frosted Glass)
  const chipW = 120;
  const chipH = 40;
  const chipX = x + width / 2 - chipW / 2;
  const chipY = Math.max(12, y - chipH - 6);

  ctx.fillStyle = 'rgba(9, 10, 15, 0.88)';
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, 6);
  ctx.fill();

  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, 6);
  ctx.stroke();

  // Speed Number (Large, Razor-Sharp)
  ctx.fillStyle = isOverspeed ? '#f43f5e' : '#ffffff';
  ctx.font = '700 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${track.speedKmH}`, chipX + 8, chipY + 20);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('KM/H', chipX + 44, chipY + 20);

  // Status or Category
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 9px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${track.category}`, chipX + 8, chipY + 33);

  // Confidence Indicator
  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.font = '500 9px "JetBrains Mono", monospace';
  ctx.fillText(`${track.confidenceScore ?? 99}%`, chipX + chipW - 8, chipY + 33);

  ctx.restore();
}
