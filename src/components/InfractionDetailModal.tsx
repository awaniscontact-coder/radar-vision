import React, { useRef, useState } from 'react';
import { X, Printer, Download, ShieldAlert, Scale, Calendar, MapPin, Gauge, Calculator, Check } from 'lucide-react';
import { SpeedInfraction } from '../types/radar';

interface InfractionDetailModalProps {
  infraction: SpeedInfraction | null;
  onClose: () => void;
  onUpdatePlate?: (infractionId: string, newPlate: string) => void;
}

export const InfractionDetailModal: React.FC<InfractionDetailModalProps> = ({
  infraction,
  onClose,
  onUpdatePlate,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isEditingPlate, setIsEditingPlate] = useState<boolean>(false);
  const [plateInput, setPlateInput] = useState<string>(infraction?.plateEstimate || '');

  if (!infraction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    if (!infraction.imageSnapshot) return;
    const link = document.createElement('a');
    link.href = infraction.imageSnapshot;
    link.download = `PV_RADAR_${infraction.id}_${infraction.measuredSpeed}KMH.jpg`;
    link.click();
  };

  const handleSavePlate = () => {
    if (onUpdatePlate && plateInput.trim()) {
      onUpdatePlate(infraction.id, plateInput.trim().toUpperCase());
    }
    setIsEditingPlate(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono-tech">
                Procès-Verbal de Contrôle Automatisé de la Vitesse
              </h3>
              <p className="text-xs text-slate-400 font-mono-tech">
                Référence PV : {infraction.id} • {infraction.legalArticle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Imprimer le PV officiel"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadImage}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Télécharger le cliché certifié"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Body */}
        <div ref={printAreaRef} className="p-6 space-y-5">
          {/* Photographic Evidence Frame */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-slate-300">
                Cliché Photographique Cinémométrique Certifié
              </span>
              <span className="text-cyan-400">{infraction.measurementMethodName ?? 'Cinémomètre Optique Certifié'}</span>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black shadow-inner">
              {infraction.imageSnapshot ? (
                <img
                  src={infraction.imageSnapshot}
                  alt={`Cliché d'infraction ${infraction.id}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono-tech text-xs">
                  Cliché non disponible
                </div>
              )}

              <div className="absolute top-3 left-3 bg-red-600/90 text-white font-mono-tech px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider shadow">
                INFRACTION VITESSE CONSTATÉE
              </div>
            </div>
          </div>

          {/* Real Physical Calculation Breakdown Panel */}
          <div className="bg-slate-950 border border-cyan-900/50 rounded-xl p-4 font-mono-tech text-xs space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Calcul Physique Rigoureux de la Vitesse Réelle</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-slate-300">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Distance Étalonnée (D)</span>
                <span className="text-base font-bold text-white">
                  {(infraction.gateDistanceMeters ?? 10).toFixed(2)} m
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Temps de Franchissement (Δt)</span>
                <span className="text-base font-bold text-cyan-300">
                  {infraction.elapsedTimeMs ?? Math.round((10 / (Math.max(1, infraction.measuredSpeed) / 3.6)) * 1000)} ms{' '}
                  <span className="text-xs text-slate-400 font-normal">
                    {(((infraction.elapsedTimeMs ?? Math.round((10 / (Math.max(1, infraction.measuredSpeed) / 3.6)) * 1000))) / 1000).toFixed(3)} s
                  </span>
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Correction Cosinus d'Angle</span>
                <span className="text-base font-bold text-amber-300">
                  {infraction.cameraAngleDegrees ?? 0}°{' '}
                  <span className="text-xs text-slate-400 font-normal">
                    (cos: {Math.cos(((infraction.cameraAngleDegrees ?? 0) * Math.PI) / 180).toFixed(3)})
                  </span>
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1">
              Formule physique appliquée :{' '}
              <strong className="text-cyan-300">{infraction.physicalCalculationDetail}</strong>
            </div>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-tech">
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] text-slate-400 block uppercase">1. Vitesse Mesurée Brute</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-rose-400">{infraction.measuredSpeed}</span>
                <span className="text-[10px] text-slate-500">km/h</span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] text-slate-400 block uppercase">2. Marge d'Erreur (EMT)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-emerald-400">
                  -{infraction.measuredSpeed <= 100 ? 5 : Math.round(infraction.measuredSpeed * 0.05)}
                </span>
                <span className="text-[10px] text-slate-500">
                  {infraction.measuredSpeed <= 100 ? 'km/h' : '%'}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] text-slate-400 block uppercase">3. Vitesse Retenue Officielle</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-amber-400">{infraction.retainedSpeed}</span>
                <span className="text-[10px] text-slate-500">km/h</span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] text-slate-400 block uppercase">4. Excès Net Constaté</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-rose-500">+{infraction.excessSpeed}</span>
                <span className="text-[10px] text-slate-500">km/h</span>
              </div>
            </div>
          </div>

          {/* Legal Sanction Panel according to French Highway Code */}
          <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-4 font-mono-tech">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold uppercase tracking-wider">
                <Scale className="w-4 h-4 text-rose-400" />
                <span>Qualification Juridique : {infraction.sanction.classType}</span>
              </div>
              <span className="text-[10px] text-slate-400">Code de la Route Art. R413-14</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-100">
                  Amende forfaitaire légale :{' '}
                  <span className="text-rose-400 font-extrabold">{infraction.sanction.fineAmount} €</span>
                </div>
                <div className="text-xs text-amber-300">
                  Retrait de points sur permis :{' '}
                  <span className="font-bold">
                    {infraction.sanction.points} point{infraction.sanction.points > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 max-w-sm leading-relaxed">
                {infraction.sanction.description}
              </div>
            </div>
          </div>

          {/* Vehicle and Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-tech border-t border-slate-800 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Véhicule :</span>
                <strong className="text-slate-200">
                  {infraction.category} ({infraction.colorName})
                </strong>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Horodatage précis :</span>
                <strong className="text-slate-200">{infraction.timestamp}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-slate-400 font-semibold">Immatriculation :</span>
                {isEditingPlate ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={plateInput}
                      onChange={(e) => setPlateInput(e.target.value)}
                      className="px-2 py-0.5 bg-slate-800 border border-slate-600 rounded text-white text-xs font-bold w-28 uppercase"
                      placeholder="AA-123-AA"
                    />
                    <button
                      onClick={handleSavePlate}
                      className="p-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white text-slate-900 font-bold rounded text-xs border border-slate-400 tracking-wider">
                      {infraction.plateEstimate}
                    </span>
                    <button
                      onClick={() => setIsEditingPlate(true)}
                      className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      (Modifier)
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lieu du contrôle :</span>
                <strong className="text-slate-200">{infraction.location}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono-tech">
            Dispositif cinémométrique agréé • Conforme Arrêté du 4 juin 2009 & Code de la Route
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Fermer le PV
          </button>
        </div>
      </div>
    </div>
  );
};
