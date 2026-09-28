import React from 'react';
import { X, Settings, Volume2, Sliders, Shield, Zap, RefreshCw } from 'lucide-react';
import { RadarConfig } from '../types/radar';

interface RadarSettingsModalProps {
  isOpen: boolean;
  config: RadarConfig;
  onUpdateConfig: (updater: (prev: RadarConfig) => RadarConfig) => void;
  onClose: () => void;
  onResetDefaults: () => void;
}

const SPEED_PRESETS = [
  { label: 'Zone 30', value: 30, desc: 'École / Quartier résidentiel' },
  { label: '50 km/h', value: 50, desc: 'Agglomération urbaine' },
  { label: '70 km/h', value: 70, desc: 'Périphérique / Rocade' },
  { label: '80 km/h', value: 80, desc: 'Route bidirectionnelle' },
  { label: '90 km/h', value: 90, desc: 'Route séparée' },
  { label: '110 km/h', value: 110, desc: 'Voie express' },
  { label: '130 km/h', value: 130, desc: 'Autoroute' },
];

export const RadarSettingsModal: React.FC<RadarSettingsModalProps> = ({
  isOpen,
  config,
  onUpdateConfig,
  onClose,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono-tech">
                Configuration & Calibrage du Radar
              </h3>
              <p className="text-xs text-slate-400 font-mono-tech">
                Paramètres cinémométriques et seuils d'alertes automatiques
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 font-mono-tech text-xs max-h-[75vh] overflow-y-auto">
          {/* Measurement System Selector */}
          <div>
            <label className="text-slate-200 font-semibold block mb-2 uppercase tracking-wider flex items-center justify-between">
              <span>Système de Calcul de Vitesse (Métrologie Optique)</span>
              <span className="text-[10px] text-cyan-400 font-normal">3 systèmes scientifiques certifiés</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => onUpdateConfig((c) => ({ ...c, measurementMethod: 'kalman_ground_plane' }))}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  (config.measurementMethod || 'kalman_ground_plane') === 'kalman_ground_plane' || config.measurementMethod === 'trajectory_regression' || config.measurementMethod === 'stadiametric'
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-sm ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Filtre Kalman Sol
                  </div>
                  <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">Recommandé • Haute Précision</div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Plan de roulage étalonné et filtre récursif de Kalman 2-états sur le <strong>front d'attaque rigide</strong> (pare-choc avant). Zéro saut d'image, zéro déformation.
                </p>
              </button>

              <button
                onClick={() => onUpdateConfig((c) => ({ ...c, measurementMethod: 'subpixel_optical_barrier' }))}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  config.measurementMethod === 'subpixel_optical_barrier' || config.measurementMethod === 'dual_gate'
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-sm ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Barrière Sub-Pixel
                  </div>
                  <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">Microseconde A → B</div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Chronométrage continu avec interpolation temporelle sub-frame entre Porte A et Porte B. Précision absolue sur distance fixe.
                </p>
              </button>

              <button
                onClick={() => onUpdateConfig((c) => ({ ...c, measurementMethod: 'optical_flow_vector' }))}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  config.measurementMethod === 'optical_flow_vector'
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-sm ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Flux Vectoriel
                  </div>
                  <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">Lucas-Kanade Différentiel</div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Calcul direct du champ de vecteurs de déplacement sur la carrosserie du véhicule avec moyenne élaguée anti-bruit.
                </p>
              </button>
            </div>
          </div>

          {/* Speed Limit Presets */}
          <div>
            <label className="text-slate-200 font-semibold block mb-2 uppercase tracking-wider">
              1. Vitesse Maximale Autorisée (VMA)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {SPEED_PRESETS.map((preset) => {
                const isSelected = config.speedLimit === preset.value;
                return (
                  <button
                    key={preset.value}
                    onClick={() => onUpdateConfig((c) => ({ ...c, speedLimit: preset.value }))}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-sm font-extrabold">{preset.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{preset.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom slider */}
            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400">Valeur personnalisée :</span>
              <input
                type="range"
                min={20}
                max={150}
                step={5}
                value={config.speedLimit}
                onChange={(e) =>
                  onUpdateConfig((c) => ({ ...c, speedLimit: Number(e.target.value) }))
                }
                className="flex-1 accent-cyan-400"
              />
              <span className="text-sm font-bold text-cyan-400 w-16 text-right">
                {config.speedLimit} km/h
              </span>
            </div>
          </div>

          {/* Tolerance & Distance Calibration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <label className="text-slate-300 font-semibold block">
                Marge Légale EMT
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={config.tolerance}
                  onChange={(e) =>
                    onUpdateConfig((c) => ({ ...c, tolerance: Number(e.target.value) }))
                  }
                  className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-bold"
                />
                <span className="text-slate-400">km/h</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Arrêté 4 juin 2009 : 5 km/h (&le;100) ou 5% (&gt;100).
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <label className="text-slate-300 font-semibold block">
                Distance Étalonnée
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={2}
                  max={60}
                  step={0.5}
                  value={config.gateDistanceMeters}
                  onChange={(e) =>
                    onUpdateConfig((c) => ({
                      ...c,
                      gateDistanceMeters: Math.max(1, Number(e.target.value)),
                    }))
                  }
                  className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-bold"
                />
                <span className="text-slate-400">mètres</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Distance réelle entre Porte A et Porte B.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <label className="text-slate-300 font-semibold block">
                Angle Caméra (θ)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={45}
                  value={config.cameraAngleDegrees}
                  onChange={(e) =>
                    onUpdateConfig((c) => ({
                      ...c,
                      cameraAngleDegrees: Math.max(0, Math.min(45, Number(e.target.value))),
                    }))
                  }
                  className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-bold"
                />
                <span className="text-slate-400">degrés (°)</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Correction cosinus automatique de l'angle de visée.
              </p>
            </div>
          </div>

          {/* Optical Sensitivity */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">
                Sensibilité de Détection Optique
              </label>
              <span className="text-cyan-400 font-bold">{config.sensitivity} / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={config.sensitivity}
              onChange={(e) =>
                onUpdateConfig((c) => ({ ...c, sensitivity: Number(e.target.value) }))
              }
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Faible (Environnement agité / pluie)</span>
              <span>Élevée (Conditions optimales)</span>
            </div>
          </div>

          {/* Automatic Alerts Toggles */}
          <div>
            <label className="text-slate-200 font-semibold block mb-2 uppercase tracking-wider">
              Alertes Automatiques en Cas d'Excès
            </label>
            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-slate-200 font-semibold">Alerte Sonore Radar (Sirène & Bipps)</div>
                    <div className="text-[10px] text-slate-500">
                      Déclenche un signal sonore d'urgence lors d'une vitesse anormale
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.soundAlert}
                  onChange={(e) =>
                    onUpdateConfig((c) => ({ ...c, soundAlert: e.target.checked }))
                  }
                  className="w-4 h-4 accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-slate-200 font-semibold">Annonce Vocale Synthétisée</div>
                    <div className="text-[10px] text-slate-500">
                      Annonce vocale en français de la vitesse mesurée
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.voiceAlert}
                  onChange={(e) =>
                    onUpdateConfig((c) => ({ ...c, voiceAlert: e.target.checked }))
                  }
                  className="w-4 h-4 accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="text-slate-200 font-semibold">Flash Stroboscopique Radar</div>
                    <div className="text-[10px] text-slate-500">
                      Flash visuel blanc/rouge sur l'écran lors du dépassement
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.flashEffect}
                  onChange={(e) =>
                    onUpdateConfig((c) => ({ ...c, flashEffect: e.target.checked }))
                  }
                  className="w-4 h-4 accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-slate-200 font-semibold">
                      Capture Automatique des Infractions (Cliché PV)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Enregistre la photo du véhicule avec les métadonnées dans le registre
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoCaptureInfractions}
                  onChange={(e) =>
                    onUpdateConfig((c) => ({ ...c, autoCaptureInfractions: e.target.checked }))
                  }
                  className="w-4 h-4 accent-cyan-400"
                />
              </label>
            </div>
          </div>

          {/* Location Name */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Nom / Emplacement de la zone de contrôle
            </label>
            <input
              type="text"
              value={config.locationName}
              onChange={(e) =>
                onUpdateConfig((c) => ({ ...c, locationName: e.target.value }))
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              placeholder="Ex: Boulevard de la République, Voie 1"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer"
          >
            Appliquer et Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
