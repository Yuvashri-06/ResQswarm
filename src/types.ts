export type PriorityTier = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MODERATE' | 'P4_EXTRICATED';

export interface Victim {
  id: number;
  codeName: string;
  x: number; // percentage 0-100 on map
  y: number; // percentage 0-100 on map
  sector: string; // 'Sector Alpha', 'Sector Bravo', etc.
  trappedMinutes: number;
  depthFeet: number; // 0 to 20 feet under rubble
  
  // Drone 1: Sound detection under debris
  acousticDb: number; // 20 - 75 dB
  acousticHz: number; // 300 - 3200 Hz
  acousticPattern: 'Rhythmic Tapping' | 'Distress Cries' | 'Weak Breathing' | 'Morse Code (SOS)' | 'Ambient Noise';
  acousticConfidence: number; // 0 - 100%

  // Drone 2: Temperature detection
  temperature: number; // 31.0 - 38.5 °C
  ambientTemp: number; // 10.0 - 18.0 °C
  thermalGradientDelta: number; // +°C above rubble
  thermalConfidence: number; // 0 - 100%

  // Drone 3: Vibration detection under 20ft distance
  vibrationHz: number; // 0.8 - 4.5 Hz
  vibrationAmplitude: number; // 0.05 - 1.2 mm/s
  vibrationPattern: 'Periodic Kinetic Knock' | 'Micro-tremor Heartbeat' | 'Stochastic Rubble Shift';
  seismicConfidence: number; // 0 - 100%

  // Fused Triage Priority
  priorityScore: number; // 1 - 100 (100 = urgent immediate life risk)
  priorityTier: PriorityTier;
  estimatedSurvivingHours: number;
  extricationStatus: 'Trapped' | 'Access Route Cleared' | 'Breaching Void' | 'Extricated';
  assignedTeam: string | null;
  debrisType: 'Reinforced Concrete Slab' | 'Collapsed Brick Masonry' | 'Twisted Steel & Drywall' | 'Void Pocket rubble';
  safeBreachVector: string;
}

export interface DroneTelemetry {
  id: string;
  name: string;
  callsign: string;
  type: 'ACOUSTIC' | 'THERMAL' | 'SEISMIC';
  sensorLabel: string;
  x: number;
  y: number;
  altitudeMeters: number;
  batteryPercent: number;
  headingDeg: number;
  status: 'SWEEPING' | 'LOCKED_TARGET' | 'HOVERING' | 'RETURNING';
  targetVictimId: number | null;
  sensorReadout: string;
  signalStrengthDbm: number;
  latencyMs: number;
  color: string;
}

export interface FlowchartNode {
  id: string;
  title: string;
  subtitle: string;
  role: string;
  droneResponsible?: string;
  throughput: string;
  latency: string;
  status: 'ACTIVE' | 'PROCESSING' | 'STANDBY';
  highlight?: boolean;
}

export interface RadioMessage {
  id: string;
  sender: 'AEGIS_AI' | 'DRONE_1' | 'DRONE_2' | 'DRONE_3' | 'USAR_TEAM_ALPHA' | 'USAR_TEAM_BETA' | 'INCIDENT_COMMAND';
  senderLabel: string;
  text: string;
  timestamp: string;
  priority: 'ROUTINE' | 'TACTICAL' | 'CRITICAL';
}

export interface EquipmentPlugin {
  id: string;
  name: string;
  category: 'BREACHING' | 'STABILIZATION' | 'MEDICAL' | 'DETECTION';
  status: 'AVAILABLE' | 'DEPLOYED' | 'STANDBY';
  assignedToSector?: string;
  description: string;
  weightKg: number;
  deploymentTimeMinutes: number;
}

export interface ConnectivityPlugin {
  id: string;
  name: string;
  protocol: string;
  latency: number; // ms
  bandwidthKbps: number;
  active: boolean;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED';
}

export interface OfflineSyncItem {
  id: string;
  timestamp: string;
  action: string;
  payload: any;
  synced: boolean;
}
