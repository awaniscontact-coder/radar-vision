export type VehicleCategory = 'Berline' | 'Citadine' | 'SUV' | 'Fourgon' | 'Poids Lourd' | 'Sportive' | 'Moto';

export type InfractionSeverity = 'minor' | 'moderate' | 'severe' | 'critical';

export type SpeedMeasurementMethod =
  | 'kalman_ground_plane'      // Système 1 : Trajectoire Plan Sol & Filtre Kalman Récursif (Haute Précision Front d'Attaque)
  | 'subpixel_optical_barrier'  // Système 2 : Double Barrière Métrologique Sub-Pixel A → B (Horodatage Microseconde)
  | 'optical_flow_vector'       // Système 3 : Flux Optique Différentiel Vectoriel Lucas-Kanade
  | 'stadiametric'              // Rétrocompatibilité Système Gabarit
  | 'trajectory_regression'     // Rétrocompatibilité Lissage
  | 'dual_gate';                // Rétrocompatibilité Double Porte

export interface VehicleTrack {
  id: string;
  bbox: { x: number; y: number; width: number; height: number };
  centroid: { x: number; y: number };
  leadingEdge: { x: number; y: number }; // Point rigide invariant (pare-choc avant / point de contact sol)
  speedKmH: number;
  smoothedSpeed: number;
  status: 'normal' | 'warning' | 'overspeed';
  category: VehicleCategory;
  colorName: string;
  colorHex: string;
  entryTimestamp: number;
  timeGateA: number | null;
  timeGateB: number | null;
  measuredTimeDeltaMs: number | null;
  speedCalculated: boolean;
  trajectory: { x: number; y: number; t: number; realMeters: number }[];
  plateEstimate: string;
  lane: number;
  flashed: boolean;
  methodUsed: SpeedMeasurementMethod;
  confidenceScore: number; // 0 à 100%
  distanceTraveledMeters: number;
  marginOfErrorKmH: number; // Ex: ± 0.8 km/h
  samplesAnalyzed: number;
  scaleMetersPerPx: number;
  // Propriétés Kalman Filter internes
  kalmanPos?: number;
  kalmanVel?: number;
  kalmanVar?: number;
}

export interface SpeedInfraction {
  id: string;
  vehicleId: string;
  timestamp: string;
  measuredSpeed: number;
  retainedSpeed: number;
  speedLimit: number;
  excessSpeed: number;
  severity: InfractionSeverity;
  category: VehicleCategory;
  colorName: string;
  plateEstimate: string;
  imageSnapshot: string;
  sanction: {
    points: number;
    fineAmount: number;
    description: string;
    classType: string;
  };
  location: string;
  elapsedTimeMs: number;
  gateDistanceMeters: number;
  cameraAngleDegrees: number;
  physicalCalculationDetail: string;
  legalArticle: string;
  methodUsed: SpeedMeasurementMethod;
  measurementMethodName: string;
  confidenceScore: number;
}

export interface RadarConfig {
  speedLimit: number; // km/h
  tolerance: number; // km/h
  measurementMethod: SpeedMeasurementMethod; // Méthode de calcul choisie
  vehicleStandardLengthMeters: number; // Longueur de référence de gabarit (défaut 4.50 m)
  gateDistanceMeters: number; // Distance physique entre repères / zone de mesure (mètres)
  cameraAngleDegrees: number; // Angle de visée (degrés)
  orientation: 'horizontal' | 'vertical';
  gate1Pos: number;
  gate2Pos: number;
  sensitivity: number;
  minArea: number;
  soundAlert: boolean;
  voiceAlert: boolean;
  flashEffect: boolean;
  hudMode: 'normal' | 'night_vision' | 'motion_mask';
  activeSource: 'camera' | 'simulation' | 'video_file';
  autoCaptureInfractions: boolean;
  selectedCameraId?: string;
  locationName: string;
  showPerspectiveGrid?: boolean;
}

export interface TrafficStats {
  totalScanned: number;
  totalInfractions: number;
  averageSpeed: number;
  maxSpeedRecorded: number;
  speedSum: number;
  lastInfractionTime: string | null;
}
