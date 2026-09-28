import React from 'react';
import { Volume2, VolumeX, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RadarConfig } from '../types/radar';

interface SpeedometerGaugeProps {
  currentSpeed: number;
  config: RadarConfig;
  onToggleSound: () => void;
  onSimulateExcess: () => void;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  currentSpeed,
  config,
  onToggleSound,
  onSimulateExcess,
}) => {
  const speed = Math.max(0, Math.round(currentSpeed));
  const limit = config.speedLimit;
  const tolerance = config.tolerance;
  const isOverspeed = speed > limit + tolerance;
  const isWarning = speed > limit && speed <= limit + tolerance;

  // Official French legal deduction (EMT -5 km/h if <= 100, -5% if > 100)
  const emtDeduction = speed <= 100 ? 5 : Math.round(speed * 0.05);
  const retainedSpeed = Math.max(0, speed - emtDeduction);
  const delta = speed - limit;

  // Percentage for gauge bar (0 to 160 km/h)
  const maxScale = 160;
  const fillPercent = Math.min(100, Math.round((speed / maxScale) * 100));
  const limitPercent = Math.round((limit / maxScale) * 100);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl backdrop-blur-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Télémétrie en Direct
          </span>
          <span className="text-sm font-bold text-slate-100">
            Véhicule Sous Contrôle
          </span>
        </div>

        <button
          onClick={onToggleSound}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            config.soundAlert
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-500 hover:text-slate-300'
          }`}
          title={config.soundAlert ? 'Alertes sonores activées' : 'Alertes sonores coupées'}
          aria-label="Toggle Sound"
        >
          {config.soundAlert ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Hero Speed & Speed Limit Sign Display */}
      <div className="py-6 flex items-center justify-between gap-4">
        {/* Large Crisp Speed Digits */}
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
            Vitesse Mesurée
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-6xl font-extrabold tracking-tight font-mono-numbers transition-colors duration-200 ${
                isOverspeed
                  ? 'text-rose-500 drop-shadow-[0_0_24px_rgba(244,63,94,0.4)]'
                  : isWarning
                    ? 'text-amber-400'
                    : 'text-white'
              }`}
            >
              {speed}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              km/h
            </span>
          </div>
        </div>

        {/* Authentic French Speed Limit Road Sign */}
        <div className="flex flex-col items-center">
          <div
            className="w-16 h-16 rounded-full bg-white border-[5px] border-rose-600 flex items-center justify-center shadow-lg"
            title={`Vitesse Maximale Autorisée : ${limit} km/h`}
          >
            <span className="text-2xl font-black text-slate-950 font-mono-numbers leading-none">
              {limit}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
            Limite VMA
          </span>
        </div>
      </div>

      {/* Linear Comparison Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>0</span>
          <span className="text-rose-400 font-semibold">{limit} km/h</span>
          <span>160</span>
        </div>
        <div className="relative h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          {/* Active speed progress */}
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              isOverspeed ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${fillPercent}%` }}
          />
          {/* Limit tick mark */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow"
            style={{ left: `${limitPercent}%` }}
          />
        </div>
      </div>

      {/* Compliance / Excess Status Card */}
      <div
        className={`p-3.5 rounded-xl border mb-6 flex items-center gap-3 transition-colors ${
          isOverspeed
            ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
            : isWarning
              ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
              : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
        }`}
      >
        <div
          className={`p-2 rounded-lg shrink-0 ${
            isOverspeed
              ? 'bg-rose-500/20 text-rose-400'
              : isWarning
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
          }`}
        >
          {isOverspeed ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
        </div>
        <div className="text-xs">
          <div className="font-bold text-sm">
            {isOverspeed
              ? `Excès de vitesse : +${delta} km/h`
              : isWarning
                ? `Seuil de tolérance (+${delta} km/h)`
                : 'Allure conforme à la réglementation'}
          </div>
          <div className="text-[11px] opacity-80 mt-0.5">
            {isOverspeed
              ? `Vitesse retenue officielle : ${retainedSpeed} km/h (Marge EMT -${emtDeduction})`
              : `Marge d'erreur légale de ${emtDeduction} km/h appliquée en faveur de l'usager.`}
          </div>
        </div>
      </div>

      {/* Action CTA: Test Flash Simulation */}
      <button
        onClick={onSimulateExcess}
        className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
      >
        <Zap className="w-3.5 h-3.5 text-cyan-400" />
        <span>Déclencher un Test Flash Certifié</span>
      </button>
    </div>
  );
};
