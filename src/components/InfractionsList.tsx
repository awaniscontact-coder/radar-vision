import React, { useState } from 'react';
import { Download, Trash2, FileText, ShieldAlert } from 'lucide-react';
import { SpeedInfraction } from '../types/radar';

interface InfractionsListProps {
  infractions: SpeedInfraction[];
  onSelectInfraction: (infraction: SpeedInfraction) => void;
  onClearAll: () => void;
}

export const InfractionsList: React.FC<InfractionsListProps> = ({
  infractions,
  onSelectInfraction,
  onClearAll,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filtered = infractions.filter((inf) => {
    if (filterSeverity === 'all') return true;
    return inf.severity === filterSeverity;
  });

  const exportCSV = () => {
    if (infractions.length === 0) return;
    const headers = [
      'ID',
      'Date/Heure',
      'Vitesse Mesurée (km/h)',
      'Vitesse Retenue (km/h)',
      'Limite Autorisée (km/h)',
      'Excès (km/h)',
      'Catégorie',
      'Immatriculation',
      'Amende (€)',
      'Points Retirés',
      'Lieu',
    ];

    const rows = infractions.map((i) => [
      i.id,
      i.timestamp,
      i.measuredSpeed,
      i.retainedSpeed,
      i.speedLimit,
      i.excessSpeed,
      i.category,
      i.plateEstimate,
      i.sanction.fineAmount,
      i.sanction.points,
      `"${i.location}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `radar-infractions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white tracking-tight">
              Registre des Infractions Constatées
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold font-mono-numbers">
              {infractions.length} {infractions.length > 1 ? 'dossiers' : 'dossier'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Clichés photographiques certifiés, métrologie optique et qualification juridique R.413-14
          </p>
        </div>

        {/* Filter Segmented Control & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterSeverity === 'all'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterSeverity('minor')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterSeverity === 'minor'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              &lt; 20 km/h
            </button>
            <button
              onClick={() => setFilterSeverity('moderate')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterSeverity === 'moderate'
                  ? 'bg-orange-500/20 text-orange-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              20 - 30 km/h
            </button>
            <button
              onClick={() => setFilterSeverity('severe')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterSeverity === 'severe'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              &gt; 30 km/h
            </button>
          </div>

          <button
            onClick={exportCSV}
            disabled={infractions.length === 0}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Exporter en CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onClearAll}
            disabled={infractions.length === 0}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Vider le registre"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Infractions Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          <ShieldAlert className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <span className="text-sm font-semibold text-slate-300 block">
            Aucune infraction enregistrée
          </span>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Les véhicules circulant au-delà de la vitesse maximale autorisée apparaîtront automatiquement ici avec photo certifiée et avis de contravention.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Cliché & Réf</th>
                <th className="py-3 px-3">Date & Heure</th>
                <th className="py-3 px-3">Véhicule</th>
                <th className="py-3 px-3 text-right">Vitesse Brute</th>
                <th className="py-3 px-3 text-right">Excès Net</th>
                <th className="py-3 px-3">Sanction Légale</th>
                <th className="py-3 px-3 text-center">Procès-Verbal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((inf) => {
                const isCritical = inf.severity === 'critical' || inf.severity === 'severe';
                return (
                  <tr
                    key={inf.id}
                    className="hover:bg-slate-800/30 transition group cursor-pointer"
                    onClick={() => onSelectInfraction(inf)}
                  >
                    {/* Thumbnail & ID */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-9 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden relative shrink-0 shadow-sm">
                          {inf.imageSnapshot ? (
                            <img
                              src={inf.imageSnapshot}
                              alt="Capture radar infraction"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-600">
                              N/A
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-white block font-mono-numbers">{inf.id}</span>
                          <span className="text-[11px] text-slate-500">{inf.vehicleId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 text-slate-300 font-mono-numbers whitespace-nowrap">
                      {inf.timestamp}
                    </td>

                    {/* Category & Plate */}
                    <td className="py-3 px-3 text-slate-300">
                      <div>
                        <span className="font-semibold text-slate-200">{inf.category}</span>
                        <div className="text-[11px] text-slate-500 font-mono-numbers">
                          {inf.plateEstimate} · {inf.colorName}
                        </div>
                      </div>
                    </td>

                    {/* Measured Speed */}
                    <td className="py-3 px-3 text-right font-mono-numbers">
                      <span className="text-sm font-extrabold text-rose-400">
                        {inf.measuredSpeed}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">km/h</span>
                      <div className="text-[10px] text-slate-500">
                        VMA: {inf.speedLimit} km/h
                      </div>
                    </td>

                    {/* Retained excess */}
                    <td className="py-3 px-3 text-right font-mono-numbers">
                      <span
                        className={`font-bold ${
                          isCritical ? 'text-rose-500' : 'text-amber-400'
                        }`}
                      >
                        +{inf.excessSpeed} km/h
                      </span>
                      <div className="text-[10px] text-slate-500">
                        Retenue: {inf.retainedSpeed} km/h
                      </div>
                    </td>

                    {/* Sanction */}
                    <td className="py-3 px-3">
                      <div className="text-slate-300">
                        <span className="font-bold text-rose-300 font-mono-numbers">
                          {inf.sanction.fineAmount} €
                        </span>
                        <span className="text-slate-500 mx-1.5">·</span>
                        <span className="text-amber-300 font-semibold">
                          -{inf.sanction.points} pt{inf.sanction.points > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {inf.sanction.description}
                      </div>
                    </td>

                    {/* Action open ticket */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInfraction(inf);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-cyan-600 text-slate-300 group-hover:text-slate-950 transition text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Fiche PV</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
