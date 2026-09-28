import React from 'react';
import { TrafficStats, RadarConfig } from '../types/radar';
import { Car, AlertTriangle, TrendingUp, Gauge, CheckCircle2 } from 'lucide-react';

interface StatisticsBarProps {
  stats: TrafficStats;
  config: RadarConfig;
}

export const StatisticsBar: React.FC<StatisticsBarProps> = ({ stats }) => {
  const complianceRate =
    stats.totalScanned > 0
      ? Math.max(0, Math.min(100, Math.round(((stats.totalScanned - stats.totalInfractions) / stats.totalScanned) * 100)))
      : 100;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
      {/* 1. Total Scanned */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Véhicules Scannés
          </span>
          <Car className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-white font-mono-numbers">
            {stats.totalScanned}
          </span>
          <span className="text-xs text-slate-500 font-medium">contrôlés</span>
        </div>
      </div>

      {/* 2. Total Infractions */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Infractions
          </span>
          <AlertTriangle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-rose-400 font-mono-numbers">
            {stats.totalInfractions}
          </span>
          <span className="text-xs text-slate-500 font-medium">excès</span>
        </div>
      </div>

      {/* 3. Average Speed */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Vitesse Moyenne
          </span>
          <TrendingUp className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-cyan-300 font-mono-numbers">
            {stats.averageSpeed}
          </span>
          <span className="text-xs text-slate-500 font-medium">km/h</span>
        </div>
      </div>

      {/* 4. Peak Speed */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Vitesse Max
          </span>
          <Gauge className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-amber-300 font-mono-numbers">
            {stats.maxSpeedRecorded}
          </span>
          <span className="text-xs text-slate-500 font-medium">km/h</span>
        </div>
      </div>

      {/* 5. Compliance Rate */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Taux de Respect
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-2xl font-extrabold font-mono-numbers ${
              complianceRate >= 80 ? 'text-emerald-400' : complianceRate >= 60 ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {complianceRate}%
          </span>
          <span className="text-xs text-slate-500 font-medium">conformité</span>
        </div>
      </div>
    </div>
  );
};
