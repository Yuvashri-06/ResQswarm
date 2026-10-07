import React, { useState } from 'react';
import { 
  Sliders, 
  Users, 
  ShieldAlert, 
  Navigation, 
  Wind, 
  Thermometer, 
  Layers, 
  Activity, 
  Zap, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench,
  Clock,
  Send,
  Volume2,
  Flame
} from 'lucide-react';
import { DroneTelemetry, Victim } from '../types';
import { tacticalAudio } from '../utils/audio';

interface CommandDashboardProps {
  drones: DroneTelemetry[];
  victims: Victim[];
  selectedVictimId: number | null;
  onSelectVictim: (id: number) => void;
  onRerouteDrone: (droneId: string, pattern: 'SECTOR_SWEEP' | 'TARGET_LOCK' | 'PERIMETER' | 'RETURN_BASE') => void;
  onBroadcastCoordinatorAlert: (text: string) => void;
}

export const CommandDashboard: React.FC<CommandDashboardProps> = ({
  drones,
  victims,
  selectedVictimId,
  onSelectVictim,
  onRerouteDrone,
  onBroadcastCoordinatorAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'swarm_fleet' | 'resources' | 'hazards' | 'triage_queue'>('swarm_fleet');

  // Ground teams resources
  const groundTeams = [
    {
      id: 'team-alpha',
      name: 'USAR Team Alpha (Heavy Extrication)',
      personnel: 6,
      equipment: 'Pneumatic 20T Air Bags, Hydraulic Ram 500kN',
      sector: 'Sector Alpha - Collapsed Garage',
      status: 'ACTIVE_BREACHING',
      assignedTarget: 'Survivor #01 (18.2ft deep)',
    },
    {
      id: 'team-beta',
      name: 'USAR Team Beta (Search & Stabilize)',
      personnel: 5,
      equipment: 'Fiberoptic 20ft Snake Cam, Shoring Jacks',
      sector: 'Sector Bravo - Residential Tower',
      status: 'SEARCHING',
      assignedTarget: 'Survivor #02 (Hypothermia alert)',
    },
    {
      id: 'team-med',
      name: 'Field Trauma Medical Unit',
      personnel: 4,
      equipment: 'Thermal Foil Rewarming, Oxygen concentrator',
      sector: 'Base Medical Staging Area',
      status: 'STANDBY',
      assignedTarget: 'Ready for Patient Handoff',
    },
  ];

  // Environmental Hazards
  const envHazards = {
    windSpeedMps: 4.8, // safe for drone hover (< 12 m/s)
    ambientTempC: 13.5,
    dustParticulatePpm: 68,
    structuralCollapseRisk: 'MODERATE (Seismic aftershock probability 18%)',
    radioInterferenceDbm: -92,
  };

  // Sorted victims by Priority Score descending (reducing rescue triage time!)
  const sortedVictims = [...victims].sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="space-y-6">
      {/* Coordinator Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('swarm_fleet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
            activeTab === 'swarm_fleet'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Navigation className="w-4 h-4 text-sky-400" />
          <span>Swarm Fleet Control (3 Drones)</span>
        </button>

        <button
          onClick={() => setActiveTab('triage_queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
            activeTab === 'triage_queue'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Priority Triage Queue ({victims.length} Targets)</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
            activeTab === 'resources'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Ground Rescue Resources & Teams</span>
        </button>

        <button
          onClick={() => setActiveTab('hazards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
            activeTab === 'hazards'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Wind className="w-4 h-4 text-purple-400" />
          <span>Environmental Hazards & Weather</span>
        </button>
      </div>

      {/* SWARM FLEET CONTROL TAB */}
      {activeTab === 'swarm_fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drones.map((drone) => (
            <div
              key={drone.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: drone.color }} />
                  <h4 className="font-bold text-sm text-white font-mono">{drone.name}</h4>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800" style={{ color: drone.color }}>
                  {drone.callsign}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex justify-between">
                  <span>Sensor Role:</span>
                  <span className="text-slate-200 font-semibold">{drone.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Battery Status:</span>
                  <span className="text-emerald-400 font-bold">{drone.batteryPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Hover Altitude:</span>
                  <span className="text-slate-200">{drone.altitudeMeters} meters</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Vector:</span>
                  <span className="text-sky-300">{drone.headingDeg}° Heading</span>
                </div>
                <div className="flex justify-between">
                  <span>Mesh Link RTT:</span>
                  <span className="text-emerald-400">{drone.latencyMs} ms ({drone.signalStrengthDbm} dBm)</span>
                </div>
              </div>

              {/* Reroute Flight Actions */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Command Flight Pattern:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <button
                    onClick={() => onRerouteDrone(drone.id, 'TARGET_LOCK')}
                    className="p-2 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 font-bold transition cursor-pointer"
                  >
                    Target Lock
                  </button>
                  <button
                    onClick={() => onRerouteDrone(drone.id, 'SECTOR_SWEEP')}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold transition cursor-pointer"
                  >
                    Sector Sweep
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRIORITY TRIAGE QUEUE (Slashes Search & Rescue Time!) */}
      {activeTab === 'triage_queue' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-amber-300 font-mono">
                DYNAMIC SURVIVABILITY QUEUE (TIME-TO-EXTRICATION OPTIMIZED)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Survivors auto-ranked by vital knocking audio, hypothermia risk, and 20ft entrapment depth.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              Sorted by Life Urgency
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {sortedVictims.map((v, idx) => (
              <div
                key={v.id}
                onClick={() => onSelectVictim(v.id)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-wrap items-center justify-between gap-4 ${
                  v.id === selectedVictimId
                    ? 'bg-slate-900 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full font-bold ${
                    idx === 0 ? 'bg-red-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      {v.codeName}
                      <span className={`text-[10px] px-2 py-0.2 rounded border font-bold ${
                        v.priorityTier === 'P1_CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/50' : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      }`}>
                        Priority {v.priorityScore}/100
                      </span>
                    </h4>
                    <span className="text-slate-400 text-[11px]">{v.sector}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">D1 SOUND</span>
                    <span className="text-sky-300 font-bold">{v.acousticDb} dB</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">D2 TEMP</span>
                    <span className={`font-bold ${v.temperature < 34 ? 'text-red-400' : 'text-orange-300'}`}>
                      {v.temperature}°C
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">D3 20FT DEPTH</span>
                    <span className="text-purple-300 font-bold">{v.depthFeet} ft</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block">LIFE WINDOW</span>
                    <span className="text-amber-300 font-bold">~{v.estimatedSurvivingHours} hrs</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    Status: <strong className="text-white">{v.extricationStatus}</strong>
                  </span>
                  <button className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer">
                    Inspect & Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GROUND RESCUE RESOURCES & TEAMS */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groundTeams.map((team) => (
            <div
              key={team.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">{team.name}</h4>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                  {team.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Personnel:</span>
                  <span className="text-slate-200 font-bold">{team.personnel} Specialist Operators</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Assigned Sector:</span>
                  <span className="text-sky-300">{team.sector}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Primary Mission:</span>
                  <span className="text-amber-300 font-bold">{team.assignedTarget}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block mb-1">EQUIPMENT ALLOCATED:</span>
                <span className="text-xs text-slate-300">{team.equipment}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ENVIRONMENTAL HAZARDS & WEATHER */}
      {activeTab === 'hazards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px]">WIND VELOCITY (FLIGHT SAFETY)</span>
            <div className="text-2xl font-bold text-emerald-400">{envHazards.windSpeedMps} m/s</div>
            <div className="text-[10px] text-slate-400">Safe for Drone 1 & 2 micro-hovering</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px]">AMBIENT DISASTER TEMP</span>
            <div className="text-2xl font-bold text-orange-300">{envHazards.ambientTempC}°C</div>
            <div className="text-[10px] text-slate-400">High hypothermia drop rate for deep victims</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px]">AIR PARTICULATE DUST</span>
            <div className="text-2xl font-bold text-amber-300">{envHazards.dustParticulatePpm} PPM</div>
            <div className="text-[10px] text-slate-400">Acoustic filtering bandpass active</div>
          </div>
        </div>
      )}
    </div>
  );
};
