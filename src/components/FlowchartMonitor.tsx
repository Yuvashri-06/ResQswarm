import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Flame, 
  HelpCircle, 
  Layers, 
  Maximize2, 
  Radio, 
  ShieldAlert, 
  Sparkles, 
  Volume2, 
  Zap, 
  Activity 
} from 'lucide-react';
import { FlowchartNode } from '../types';

interface FlowchartMonitorProps {
  nodes: FlowchartNode[];
  onSelectDrone: (droneId: string) => void;
  detectedCount: number;
  priorityTriageSavedMinutes: number; // e.g. 142 mins saved vs manual search
}

export const FlowchartMonitor: React.FC<FlowchartMonitorProps> = ({
  nodes,
  onSelectDrone,
  detectedCount,
  priorityTriageSavedMinutes,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('fc-2');
  const [simulationSpeed, setSimulationSpeed] = useState<string>('1x');

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[1];

  const nodeDetailsMap: Record<string, {
    description: string;
    metrics: { label: string; value: string }[];
    techStack: string;
    timeReductionImpact: string;
  }> = {
    'fc-1': {
      description: 'Autonomous multi-UAV sector assignment utilizing Voronoi partitioning and visual-inertial SLAM to blanket the disaster rubble footprint without human piloting overhead.',
      metrics: [
        { label: 'Coverage Rate', value: '420 m²/min' },
        { label: 'UAV Spacing', value: '18 meters' },
        { label: 'Mesh Sync Interval', value: '25 ms' },
      ],
      techStack: 'Distributed ROS2 / Decentralized Swarm Consensus / PX4 Autopilot',
      timeReductionImpact: 'Slashes initial grid mapping from 45 minutes (canine/manual) to under 3.5 minutes.',
    },
    'fc-2': {
      description: 'Synchronized tripartite sensor ingestion: Drone 1 isolates sound/tapping beneath concrete debris; Drone 2 measures radiometric skin surface temperatures; Drone 3 penetrates down to 20 feet using micro-vibration ground geophone radar.',
      metrics: [
        { label: 'Drone-01 Acoustic SNR', value: '+18.4 dB over debris' },
        { label: 'Drone-02 FLIR Radiometric NetD', value: '<30 mK sensitivity' },
        { label: 'Drone-03 Geophone Depth Limit', value: '20.0 feet (6.1 meters)' },
      ],
      techStack: 'MEMS Beamforming Array • FLIR Lepton 3.5 • Subsurface Seismic Impulse Radar',
      timeReductionImpact: 'Detects victims trapped 20ft under slabs without needing heavy acoustic listening sticks on foot.',
    },
    'fc-3': {
      description: 'Real-time noise filtering. Rejects heavy excavator hum, siren echos, and wind turbulence. Matches repetitive rhythmic knocking (Morse SOS, 3-taps) and human respiration frequencies (300-3400Hz).',
      metrics: [
        { label: 'Noise Rejection Ratio', value: '-38 dB background cut' },
        { label: 'Tap Coherence Threshold', value: '0.88 Pearson' },
        { label: 'Pipeline Jitter', value: '1.2 ms' },
      ],
      techStack: 'Spectral Subtraction • Wavelet Transform • Kalman Multi-Sensor Filter',
      timeReductionImpact: 'Eliminates 92% of false rubble settling alarms, preventing wasted USAR hours.',
    },
    'fc-4': {
      description: 'Dynamic Survivability Index calculation: Combines acoustic vitality (strength of knocks/breaths), hypothermia decline rate (Drone 2 temp), and physical entrapment depth (Drone 3 feet below surface) into a real-time Priority Score (P1 to P4).',
      metrics: [
        { label: 'Priority Algorithm', value: 'Weighted Multi-Criteria Decision (MCDA)' },
        { label: 'Triage Refresh Rate', value: '10 Hz continuous' },
        { label: 'Golden Hour Accuracy', value: '98.1%' },
      ],
      techStack: 'USAR Triage AI Matrix • Bayesian Survivability Decay Curve',
      timeReductionImpact: 'Ranks most critical suffocating/hypothermic survivors first, slashing golden-hour response time by 74%.',
    },
    'fc-5': {
      description: 'Automated extrication dispatch. Sends precise GPS coordinates, void depth (e.g. 18.2ft), safest drill angle, and required equipment plugins (20T airbags, hydraulic spreaders) directly to USAR teams in the field.',
      metrics: [
        { label: 'Dispatch Latency', value: '< 2.5 seconds' },
        { label: 'Equipment Match Confidence', value: '99.4%' },
        { label: 'Route Collision Check', value: 'Safe (0 hazards)' },
      ],
      techStack: 'Tactical GIS Dispatch • Auto-Routing over rubble paths • LoRa Alert broadcast',
      timeReductionImpact: 'Prevents digging at improper angles that trigger secondary rubble cave-ins.',
    },
    'fc-6': {
      description: 'Final extrication stage. Physical removal through shored void pockets, emergency thermal wrap application, and immediate vital sign telemetry handoff to field trauma surgeons.',
      metrics: [
        { label: 'Mean Extrication Duration', value: '24 minutes' },
        { label: 'Field Vitals Handoff', value: 'Zero-latency NFC/Bluetooth' },
        { label: 'Extricated Survivors', value: '1 confirmed, 4 queued' },
      ],
      techStack: 'USAR INSARAG Protocol • Field Trauma Triage Handoff',
      timeReductionImpact: 'Seamless handoff saves up to 30 critical minutes before emergency transport.',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the flow & time reduction */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs border border-sky-500/30">
              OPERATIONAL WORKFLOW
            </span>
            <h2 className="text-lg font-bold text-white">
              Rescue Swarm Autonomous Pipeline & Triage Flow
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time stage-by-stage monitoring: from 3-drone swarm autonomous launch to acoustic debris penetration, 
            FLIR thermography, 20-foot ground vibration, AI priority scoring, and ground team extrication.
          </p>
        </div>

        {/* Time reduction callout */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-lg border border-amber-500/30">
          <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400">Time-to-Rescue Reduced</div>
            <div className="text-base font-extrabold text-amber-300 font-mono">
              ~{priorityTriageSavedMinutes} Minutes Faster
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Visual Flow Chart Nodes */}
      <div className="relative overflow-x-auto pb-4">
        <div className="min-w-[900px] grid grid-cols-6 gap-3">
          {nodes.map((node, index) => {
            const isSelected = node.id === selectedNodeId;
            return (
              <div key={node.id} className="relative flex flex-col">
                <button
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all h-full flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-400 shadow-lg shadow-sky-500/10 ring-1 ring-sky-400'
                      : node.highlight
                      ? 'bg-slate-900/90 border-amber-500/50 hover:border-amber-400/80'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    {/* Step number badge & status */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        isSelected 
                          ? 'bg-sky-500 text-slate-950' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        STAGE 0{index + 1}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${
                        node.status === 'ACTIVE' 
                          ? 'bg-emerald-400 animate-ping' 
                          : node.status === 'PROCESSING' 
                          ? 'bg-amber-400' 
                          : 'bg-slate-600'
                      }`} />
                    </div>

                    <h3 className="text-xs font-bold text-slate-100 line-clamp-2 mb-1">
                      {node.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mb-3">
                      {node.subtitle}
                    </p>
                  </div>

                  {/* Node footer telemetry */}
                  <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Rate:</span>
                      <span className="text-slate-200">{node.throughput}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Delay:</span>
                      <span className="text-emerald-400">{node.latency}</span>
                    </div>
                  </div>
                </button>

                {/* Connecting arrow */}
                {index < nodes.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Specialized 3-Drone Swarm Role Breakdown (Direct User Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Drone 1: Sound detection under debris */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-sky-500/40 hover:border-sky-400 transition">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-sky-300">DRONE 01: ECHO-RAY</h4>
                <div className="text-[10px] font-mono text-slate-400">Acoustic Beamformer</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
              Active
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-2 mt-3">
            <p className="leading-relaxed">
              <strong className="text-sky-300">Role:</strong> Detects people trapped under concrete/brick debris through acoustic sound sensing.
            </p>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Frequency Band:</span>
                <span className="text-sky-300">300 - 3,400 Hz (Knocks/Voice)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Debris Attenuation:</span>
                <span className="text-slate-300">-12 dB/m compensated</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pattern Detected:</span>
                <span className="text-emerald-400 font-semibold">Rhythmic 3-Tap SOS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drone 2: Temperature detection */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-orange-500/40 hover:border-orange-400 transition">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-orange-300">DRONE 02: THERMO-HAWK</h4>
                <div className="text-[10px] font-mono text-slate-400">FLIR Radiometric Thermal</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800">
              Active
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-2 mt-3">
            <p className="leading-relaxed">
              <strong className="text-orange-300">Role:</strong> Detects survivor body surface temperature and tracks rapid hypothermia decline under rubble.
            </p>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Thermal Resolution:</span>
                <span className="text-orange-300">640×512 Radiometric</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delta-T Sensitivity:</span>
                <span className="text-slate-300">0.05°C differential</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hypothermia Threshold:</span>
                <span className="text-amber-400 font-semibold">&lt; 34.0°C (Auto-Priority)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drone 3: Vibration detection under 20-feet distance */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/40 hover:border-purple-400 transition">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-300">DRONE 03: SEISMO-PROBE</h4>
                <div className="text-[10px] font-mono text-slate-400">20ft Subsurface Geophone</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
              Active
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-2 mt-3">
            <p className="leading-relaxed">
              <strong className="text-purple-300">Role:</strong> Penetrates down to <span className="font-bold text-white underline decoration-purple-400">20 feet distance</span> beneath rubble using micro-vibration radar.
            </p>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Max Radar Depth:</span>
                <span className="text-purple-300 font-bold">20.0 ft / 6.1 meters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ground Coupling:</span>
                <span className="text-slate-300">Acoustic-seismic impulse</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Micro-tremor Band:</span>
                <span className="text-emerald-400 font-semibold">0.5 - 5.0 Hz pulse</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Stage Deep-Dive Panel */}
      <div className="p-5 rounded-xl bg-slate-900/95 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">
              Stage Telemetry Deep Dive: {selectedNode.title}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Node ID: {selectedNode.id}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {nodeDetailsMap[selectedNode.id]?.description || selectedNode.role}
        </p>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {nodeDetailsMap[selectedNode.id]?.metrics.map((m, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800/90 font-mono">
              <div className="text-[10px] text-slate-400 uppercase">{m.label}</div>
              <div className="text-sm font-bold text-sky-300 mt-0.5">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Time Reduction Mechanism */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-3">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Time Reduction Engineering: </span>
            <span className="text-slate-300">
              {nodeDetailsMap[selectedNode.id]?.timeReductionImpact}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
