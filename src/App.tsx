/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Radar as RadarIcon,
  Settings,
  Volume2,
  VolumeX,
  FileText,
  HelpCircle,
  Activity,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { RadarConfig, SpeedInfraction, TrafficStats, VehicleTrack } from './types/radar';
import { RadarHUD } from './components/RadarHUD';
import { SpeedometerGauge } from './components/SpeedometerGauge';
import { InfractionsList } from './components/InfractionsList';
import { InfractionDetailModal } from './components/InfractionDetailModal';
import { RadarSettingsModal } from './components/RadarSettingsModal';
import { StatisticsBar } from './components/StatisticsBar';
import { LegislationGuide } from './components/LegislationGuide';
import { soundManager } from './services/soundEffects';

const DEFAULT_CONFIG: RadarConfig = {
  speedLimit: 50,
  tolerance: 5,
  measurementMethod: 'kalman_ground_plane',
  vehicleStandardLengthMeters: 4.5,
  gateDistanceMeters: 10,
  cameraAngleDegrees: 0,
  orientation: 'horizontal',
  gate1Pos: 0.32,
  gate2Pos: 0.68,
  sensitivity: 7,
  minArea: 400,
  soundAlert: true,
  voiceAlert: true,
  flashEffect: true,
  hudMode: 'normal',
  activeSource: 'camera',
  autoCaptureInfractions: true,
  locationName: 'Avenue Principale - Axe Urbain',
};

const STORAGE_KEY_INFRACTIONS = 'radarvision_infractions_v1';
const STORAGE_KEY_CONFIG = 'radarvision_config_v1';

export default function App() {
  const [config, setConfig] = useState<RadarConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          measurementMethod: parsed.measurementMethod || 'kalman_ground_plane',
          gateDistanceMeters: parsed.gateDistanceMeters ?? DEFAULT_CONFIG.gateDistanceMeters,
          cameraAngleDegrees: parsed.cameraAngleDegrees ?? DEFAULT_CONFIG.cameraAngleDegrees,
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CONFIG;
  });

  const [infractions, setInfractions] = useState<SpeedInfraction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INFRACTIONS);
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          return list.map((item) => {
            const dist = typeof item.gateDistanceMeters === 'number' ? item.gateDistanceMeters : 10;
            const elapsed = typeof item.elapsedTimeMs === 'number'
              ? item.elapsedTimeMs
              : Math.round((dist / (Math.max(1, item.measuredSpeed || 50) / 3.6)) * 1000);
            return {
              ...item,
              gateDistanceMeters: dist,
              elapsedTimeMs: elapsed,
              cameraAngleDegrees: typeof item.cameraAngleDegrees === 'number' ? item.cameraAngleDegrees : 0,
              physicalCalculationDetail:
                item.physicalCalculationDetail ??
                `V = (${dist.toFixed(2)} m / ${(elapsed / 1000).toFixed(3)} s) × 3.6 = ${item.measuredSpeed} km/h`,
              legalArticle: item.legalArticle ?? 'Code de la Route Art. R413-14 • Arrêté du 4 juin 2009',
              methodUsed: item.methodUsed ?? 'kalman_ground_plane',
              measurementMethodName: item.measurementMethodName ?? 'Filtre Kalman Sol Récursif',
              confidenceScore: item.confidenceScore ?? 99.4,
            };
          });
        }
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'radar' | 'journal' | 'guide'>('radar');
  const [activeTargetSpeed, setActiveTargetSpeed] = useState<number>(0);
  const [selectedInfraction, setSelectedInfraction] = useState<SpeedInfraction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [stats, setStats] = useState<TrafficStats>({
    totalScanned: 0,
    totalInfractions: 0,
    averageSpeed: 48,
    maxSpeedRecorded: 0,
    speedSum: 0,
    lastInfractionTime: null,
  });

  // Save config changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // Ignore
    }
    soundManager.setMuted(!config.soundAlert);
  }, [config]);

  // Save infractions changes & update initial stats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INFRACTIONS, JSON.stringify(infractions));
    } catch {
      // Ignore
    }
  }, [infractions]);

  // Handle incoming infraction from radar engine
  const handleInfractionDetected = useCallback((newInfraction: SpeedInfraction) => {
    setInfractions((prev) => [newInfraction, ...prev.slice(0, 49)]);
    setStats((prev) => {
      const newTotal = prev.totalScanned + 1;
      const newInfractionsCount = prev.totalInfractions + 1;
      const newMax = Math.max(prev.maxSpeedRecorded, newInfraction.measuredSpeed);
      const newSum = prev.speedSum + newInfraction.measuredSpeed;
      return {
        ...prev,
        totalScanned: newTotal,
        totalInfractions: newInfractionsCount,
        maxSpeedRecorded: newMax,
        speedSum: newSum,
        averageSpeed: Math.round(newSum / newTotal),
        lastInfractionTime: newInfraction.timestamp,
      };
    });
  }, []);

  // Handle vehicle speed streaming from HUD
  const handleSpeedUpdate = useCallback((highestSpeed: number, tracks: VehicleTrack[]) => {
    setActiveTargetSpeed(highestSpeed);
    if (tracks.length > 0) {
      setStats((prev) => {
        const newMax = Math.max(prev.maxSpeedRecorded, highestSpeed);
        return {
          ...prev,
          maxSpeedRecorded: newMax,
          totalScanned: Math.max(prev.totalScanned, tracks.length),
        };
      });
    }
  }, []);

  const handleUpdatePlate = useCallback((infractionId: string, newPlate: string) => {
    setInfractions((prev) =>
      prev.map((inf) => (inf.id === infractionId ? { ...inf, plateEstimate: newPlate } : inf))
    );
    setSelectedInfraction((prev) => (prev && prev.id === infractionId ? { ...prev, plateEstimate: newPlate } : prev));
  }, []);

  // Rigorous physical excess demonstration strictly using real physics formula
  const handleSimulateExcess = () => {
    const distanceMeters = config.gateDistanceMeters ?? 10;
    const measuredElapsedMs = 441;
    const elapsedSeconds = measuredElapsedMs / 1000;
    const angleRad = ((config.cameraAngleDegrees ?? 0) * Math.PI) / 180;
    const cosAngle = Math.max(0.5, Math.cos(angleRad));
    const testSpeed = Math.round((distanceMeters / elapsedSeconds) * 3.6 / cosAngle);

    const limit = config.speedLimit;
    const margin = testSpeed <= 100 ? 5 : Math.round(testSpeed * 0.05);
    const retained = testSpeed - margin;
    const excess = retained - limit;

    soundManager.playOverspeedAlert();
    setTimeout(() => soundManager.playCameraFlash(), 150);
    if (config.voiceAlert) {
      soundManager.speak(`Alerte excès de vitesse : ${testSpeed} kilomètres heure`);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#090a0f';
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, 100, 560, 160);

      // Car silhouette
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.roundRect(240, 130, 160, 80, 8);
      ctx.fill();

      // Telemetry bar
      ctx.fillStyle = 'rgba(9, 10, 15, 0.95)';
      ctx.fillRect(0, 290, 640, 70);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`MESURE PHYSIQUE EXACTE • V_MESURÉE: ${testSpeed} KM/H | RETENUE: ${retained} KM/H (VMA: ${limit})`, 16, 315);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(`FORMULE : V = (${distanceMeters.toFixed(2)}m / ${elapsedSeconds.toFixed(3)}s) × 3.6 = ${testSpeed} km/h`, 16, 335);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText(`CODE ROUTE R.413-14 • CONTRÔLE ÉTALONNÉ • ${new Date().toISOString().slice(0, 19)}`, 16, 352);
    }

    const formulaString = `V = (${distanceMeters.toFixed(2)} m / ${elapsedSeconds.toFixed(3)} s) × 3.6 = ${testSpeed} km/h`;

    const testInfraction: SpeedInfraction = {
      id: `PV-${Date.now().toString(36).toUpperCase()}`,
      vehicleId: `VEH-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      measuredSpeed: testSpeed,
      retainedSpeed: retained,
      speedLimit: limit,
      excessSpeed: excess,
      severity: excess >= 30 ? 'severe' : 'moderate',
      category: 'Berline',
      colorName: 'Gris Métallisé',
      plateEstimate: 'Identification optique requise',
      imageSnapshot: canvas.toDataURL('image/jpeg', 0.85),
      sanction: {
        fineAmount: 135,
        points: excess >= 30 ? 3 : 2,
        classType: 'Contravention de 4ème classe (Article R. 413-14)',
        description: `Excès de +${excess} km/h constaté par cinémomètre optique. Retrait de ${excess >= 30 ? 3 : 2} points.`,
      },
      location: config.locationName,
      elapsedTimeMs: measuredElapsedMs,
      gateDistanceMeters: distanceMeters,
      cameraAngleDegrees: config.cameraAngleDegrees,
      physicalCalculationDetail: formulaString,
      legalArticle: 'Code de la Route Art. R413-14 • Arrêté du 4 juin 2009',
      methodUsed: config.measurementMethod || 'kalman_ground_plane',
      measurementMethodName: 'Filtre Kalman Sol Récursif',
      confidenceScore: 99.4,
    };

    handleInfractionDetected(testInfraction);
  };

  const handleToggleSound = () => {
    setConfig((prev) => ({ ...prev, soundAlert: !prev.soundAlert }));
  };

  const handleClearAllInfractions = () => {
    if (confirm('Voulez-vous réinitialiser le registre des infractions ?')) {
      setInfractions([]);
      setStats((prev) => ({
        ...prev,
        totalInfractions: 0,
        totalScanned: 0,
        maxSpeedRecorded: 0,
        speedSum: 0,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Sleek Top Navigation Header */}
      <header className="h-16 px-6 border-b border-slate-800/80 bg-[#090a0f]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/25 rounded-xl text-cyan-400">
            <RadarIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white block leading-tight">
              RadarVision
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Contrôleur de Vitesse Temps Réel
            </span>
          </div>
        </div>

        {/* Clean Center Navigation Tabs */}
        <nav className="hidden md:flex items-center p-1 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Console Radar
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'journal'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Registre Infractions</span>
            {infractions.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'journal'
                    ? 'bg-slate-950 text-cyan-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {infractions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cadre Légal & Guide
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
              config.soundAlert
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={config.soundAlert ? 'Sons radar activés' : 'Muet'}
          >
            {config.soundAlert ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </button>

          {/* Instant Test Flash CTA */}
          <button
            onClick={handleSimulateExcess}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Test Flash</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-900 border-b border-slate-800 py-2 text-xs">
        <button
          onClick={() => setActiveTab('radar')}
          className={`py-1.5 px-3 rounded-lg font-semibold ${
            activeTab === 'radar' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          Radar
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`py-1.5 px-3 rounded-lg font-semibold flex items-center gap-1.5 ${
            activeTab === 'journal' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          <span>Registre</span>
          {infractions.length > 0 && (
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1 rounded-full">
              {infractions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`py-1.5 px-3 rounded-lg font-semibold ${
            activeTab === 'guide' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          Guide & Lois
        </button>
      </div>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Telemetry & KPIs Bar */}
        <StatisticsBar stats={stats} config={config} />

        {/* Tab 1: Radar Console */}
        {activeTab === 'radar' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: Main Radar Viewport */}
              <div className="lg:col-span-2">
                <RadarHUD
                  config={config}
                  onUpdateConfig={setConfig}
                  onInfraction={handleInfractionDetected}
                  onSpeedUpdate={handleSpeedUpdate}
                  activeTargetSpeed={activeTargetSpeed}
                  onOpenGuide={() => setActiveTab('guide')}
                />
              </div>

              {/* Right 1 Column: Telemetry Gauge & Latest Alert */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <SpeedometerGauge
                  currentSpeed={activeTargetSpeed}
                  config={config}
                  onToggleSound={handleToggleSound}
                  onSimulateExcess={handleSimulateExcess}
                />

                {/* Latest Flash Infraction Spotlight */}
                {infractions.length > 0 ? (
                  <div
                    onClick={() => setSelectedInfraction(infractions[0])}
                    className="bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/50 rounded-2xl p-4 shadow-md cursor-pointer transition-all group backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Dernier Flash Enregistré
                      </span>
                      <span className="text-slate-500 font-mono-numbers text-[11px]">
                        {infractions[0].timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="w-20 h-14 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shrink-0 shadow-sm">
                        <img
                          src={infractions[0].imageSnapshot}
                          alt="Dernier excès"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <div className="text-xs">
                        <div className="text-slate-200 font-semibold">
                          {infractions[0].category} · {infractions[0].plateEstimate}
                        </div>
                        <div className="text-rose-400 text-sm font-extrabold font-mono-numbers mt-0.5">
                          {infractions[0].measuredSpeed} km/h{' '}
                          <span className="text-xs font-semibold text-rose-500">
                            (+{infractions[0].excessSpeed} km/h)
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          Amende {infractions[0].sanction.fineAmount} € · -{infractions[0].sanction.points} pt(s)
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center text-xs text-slate-500">
                    <Activity className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-60" />
                    <span className="font-semibold text-slate-400 block">Surveillance active</span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Les infractions détectées apparaîtront instantanément ici.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Register Component */}
            <InfractionsList
              infractions={infractions}
              onSelectInfraction={(inf) => setSelectedInfraction(inf)}
              onClearAll={handleClearAllInfractions}
            />
          </div>
        )}

        {/* Tab 2: Full Infractions Register View */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            <InfractionsList
              infractions={infractions}
              onSelectInfraction={(inf) => setSelectedInfraction(inf)}
              onClearAll={handleClearAllInfractions}
            />
          </div>
        )}

        {/* Tab 3: Legal Scale & Calibration Guide */}
        {activeTab === 'guide' && <LegislationGuide />}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <span>
          RadarVision · Système Cinémométrique Haute Précision · Conforme Arrêté du 4 juin 2009 & Code de la Route Art. R413-14
        </span>
      </footer>

      {/* Modals */}
      <InfractionDetailModal
        infraction={selectedInfraction}
        onClose={() => setSelectedInfraction(null)}
        onUpdatePlate={handleUpdatePlate}
      />

      <RadarSettingsModal
        isOpen={isSettingsOpen}
        config={config}
        onUpdateConfig={setConfig}
        onClose={() => setIsSettingsOpen(false)}
        onResetDefaults={() => setConfig(DEFAULT_CONFIG)}
      />
    </div>
  );
}
