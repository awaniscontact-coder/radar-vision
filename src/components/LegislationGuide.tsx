import React from 'react';
import { Scale, Crosshair, Camera, BookOpen, CheckCircle2, AlertTriangle, Compass, ShieldCheck } from 'lucide-react';

export const LegislationGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* SECTION 1: GUIDE PRATIQUE DE POSITIONNEMENT OPTIMAL DU RADAR */}
      <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                <Camera className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Guide de Positionnement Optimal de la Caméra
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configuration géométrique recommandée pour obtenir une vitesse 100% exacte sans erreur de perspective
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
            Recommandations Métrologiques
          </span>
        </div>

        {/* 4 Golden Rules Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Rule 1: Angle */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-cyan-400 font-bold text-xs">
                <span>1. ANGLE DE VISÉE</span>
                <Compass className="w-4 h-4" />
              </div>
              <div className="text-lg font-extrabold text-white mt-1">15° à 25° (3/4 Profil)</div>
              <p className="text-slate-400 leading-relaxed mt-2">
                <strong>À proscrire :</strong> Ne placez jamais la caméra face à la voiture (0°), car le déplacement en pixels est trop faible.
              </p>
              <p className="text-slate-400 leading-relaxed mt-1">
                <strong>Idéal :</strong> Placez-vous sur le trottoir ou en bordure avec un angle de 15° à 25°. Le véhicule traverse l'écran de gauche à droite avec un maximum de pixels par mètre.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-cyan-300">
              ✓ Pensez à ajuster le curseur d'angle (θ) dans le panneau d'étalonnage.
            </div>
          </div>

          {/* Rule 2: Height */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-cyan-400 font-bold text-xs">
                <span>2. HAUTEUR DE FIXATION</span>
                <Crosshair className="w-4 h-4" />
              </div>
              <div className="text-lg font-extrabold text-white mt-1">1,20 m à 2,50 m</div>
              <p className="text-slate-400 leading-relaxed mt-2">
                Positionnez la caméra sur un <strong>trépied stable</strong> ou à hauteur d'homme (ou depuis une fenêtre de 1er étage).
              </p>
              <p className="text-slate-400 leading-relaxed mt-1">
                Une légère vue plongeante permet de voir les roues au contact de l'asphalte et empêche les véhicules proches de masquer complètement la voie opposée.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-cyan-300">
              ✓ Évite les éblouissements rasants des phares la nuit.
            </div>
          </div>

          {/* Rule 3: Stability */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-rose-400 font-bold text-xs">
                <span>3. STABILITÉ ABSOLUE</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-lg font-extrabold text-white mt-1">Caméra 100% Immobile</div>
              <p className="text-slate-400 leading-relaxed mt-2">
                <strong>Attention capitale :</strong> Ne tenez jamais le téléphone ou la caméra à bout de bras. Tout tremblement de la main fausse le différentiel d'images.
              </p>
              <p className="text-slate-400 leading-relaxed mt-1">
                Fixez l'appareil sur un support fixe : trépied, rebord rigide ou ventouse sur vitre.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-rose-300">
              ⚠ Un bougé de caméra = erreur de calcul immédiate.
            </div>
          </div>

          {/* Rule 4: Distance calibration */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                <span>4. ÉTALONNAGE A-B</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-lg font-extrabold text-white mt-1">Distance Mesurée</div>
              <p className="text-slate-400 leading-relaxed mt-2">
                Alignez la <strong>Porte A</strong> et la <strong>Porte B</strong> sur deux repères visuels réels dont vous connaissez la distance exacte (10 m, 13 m ou 25 m).
              </p>
              <p className="text-slate-400 leading-relaxed mt-1">
                Plus la distance entre A et B est grande (10 à 25 m), plus l'incertitude temporelle diminue et plus la vitesse est exacte.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-300">
              ✓ Glissez directement les lignes A et B sur la vidéo.
            </div>
          </div>
        </div>

        {/* Repères routiers officiels de calibrage */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>Comment mesurer la distance au sol facilement ? (Normes Routières Françaises)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Vous n'avez pas de mètre ruban sous la main ? Utilisez les dimensions standardisées des marquages peints sur la chaussée :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <strong className="text-white block mb-1">Ligne de rive (côté droit) :</strong>
              <span className="text-slate-400">1 trait = <strong>3 m</strong>, 1 vide = <strong>10 m</strong>. Du début d'un trait au début du suivant = <strong className="text-cyan-300">exactement 13 mètres</strong>.</span>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <strong className="text-white block mb-1">Ligne de guidage / virage :</strong>
              <span className="text-slate-400">1 trait = <strong>3 m</strong>, 1 vide = <strong>1,33 m</strong>. Deux traits consécutifs = <strong className="text-cyan-300">7,33 mètres</strong>.</span>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <strong className="text-white block mb-1">Passage piéton urbain :</strong>
              <span className="text-slate-400">Bandes blanches de 50 cm. La traversée totale mesure généralement <strong className="text-cyan-300">entre 2,50 m et 3,00 m</strong> de large.</span>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <strong className="text-white block mb-1">Ligne d'axe autoroute :</strong>
              <span className="text-slate-400">1 trait blanc = <strong>38 m</strong>, espacement = <strong>14 m</strong>. Le cycle complet mesure <strong className="text-cyan-300">52 mètres</strong>.</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CADRE LÉGAL ET RETRAIT DE POINTS */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <span>Cadre Légal Officiel & Barème des Sanctions Routières</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Réglementation officielle française (Code de la Route Article R.413-14 & Arrêté du 4 juin 2009)
          </p>
        </div>

        {/* Grid of Legal Sanctions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="text-amber-400 font-bold uppercase text-[11px]">
              Contravention 3e / 4e classe : Excès &lt; 20 km/h
            </div>
            <div className="text-xl font-bold text-slate-100 font-mono-numbers">68 € ou 135 €</div>
            <div className="text-slate-400 leading-relaxed">
              Retrait de <strong>1 point</strong>. Amende à 68 € hors agglomération (&gt;50 km/h) et 135 € en agglomération (≤50 km/h). Point récupéré après 6 mois sans infraction.
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="text-orange-400 font-bold uppercase text-[11px]">
              Contravention 4e classe : Excès 20 à 29 km/h
            </div>
            <div className="text-xl font-bold text-slate-100 font-mono-numbers">135 €</div>
            <div className="text-slate-400 leading-relaxed">
              Retrait de <strong>2 points</strong>. Amende forfaitaire de 135 € (minorée 90 €, majorée 375 €). Points récupérés après 2 ans sans infraction.
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="text-rose-400 font-bold uppercase text-[11px]">
              Contravention 4e classe : Excès 30 à 49 km/h
            </div>
            <div className="text-xl font-bold text-slate-100 font-mono-numbers">135 €</div>
            <div className="text-slate-400 leading-relaxed">
              Retrait de <strong>3 points</strong> (30-39 km/h) ou <strong>4 points</strong> (40-49 km/h). Suspension de permis encourue jusqu'à 3 ans.
            </div>
          </div>

          <div className="bg-slate-950/70 border border-rose-900/60 bg-rose-950/10 p-4 rounded-xl space-y-2">
            <div className="text-rose-500 font-bold uppercase text-[11px]">
              Délit Pénal : Excès ≥ 50 km/h
            </div>
            <div className="text-xl font-bold text-rose-300 font-mono-numbers">Jusqu'à 1 500 €</div>
            <div className="text-slate-300 leading-relaxed">
              Article L.224-2 & R.413-14-1 : Retrait de <strong>6 points</strong>, rétention administrative immédiate (72h), suspension jusqu'à 3 ans et confiscation du véhicule.
            </div>
          </div>
        </div>

        {/* Ministerial Decree 4 June 2009 for Technical Error Margin */}
        <div className="bg-slate-950/80 border border-cyan-900/60 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Arrêté ministériel du 4 juin 2009 relatif aux cinémomètres de contrôle routier</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            En métrologie légale routière française (Annexe I, Article 6), tout cinémomètre est soumis à une <strong>Erreur Maximale Tolérée (EMT)</strong> systématiquement déduite de la vitesse mesurée brute en faveur du conducteur :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 pt-1">
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <strong className="text-white block mb-1">Pour une vitesse mesurée ≤ 100 km/h :</strong>
              <span>Marge légale EMT fixe de <strong className="text-emerald-400">5 km/h</strong> déduite (Exemple : mesuré à 58 km/h → retenu à 53 km/h).</span>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <strong className="text-white block mb-1">Pour une vitesse mesurée &gt; 100 km/h :</strong>
              <span>Marge légale EMT de <strong className="text-emerald-400">5 %</strong> déduite (Exemple : mesuré à 138 km/h → retenu à 131 km/h).</span>
            </div>
          </div>
        </div>

        {/* Technical Systems Explanation */}
        <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Crosshair className="w-4 h-4" />
            <span>Les 3 Systèmes Scientifiques Intégrés au Radar</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <strong className="text-cyan-400 block mb-1">1. Kalman Sol (Recommandé) :</strong>
              <span className="text-slate-400 leading-relaxed">
                Projection plane au sol et filtre récursif de Kalman 2 états ($p_k, v_k$) sur le <em>front d'attaque rigide</em> (pare-choc avant). Élimine les instabilités de cadence d'images et les bruits optiques.
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <strong className="text-emerald-400 block mb-1">2. Barrière Sub-Pixel :</strong>
              <span className="text-slate-400 leading-relaxed">
                Interpolation temporelle sub-frame continue au franchissement des Portes A et B : $V = (D / \Delta t) \times 3.6 / \cos(\theta)$. Précision microseconde.
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <strong className="text-amber-400 block mb-1">3. Flux Optique Lucas-Kanade :</strong>
              <span className="text-slate-400 leading-relaxed">
                Moyenne élaguée des vecteurs de déplacement des points d'intérêt sur la carrosserie métallique du véhicule.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
