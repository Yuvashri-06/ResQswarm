import React from 'react';
import { 
  Radio, 
  Activity, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  PlusCircle, 
  RefreshCw,
  Box,
  Layers,
  Crosshair,
  Github
} from 'lucide-react';
import { tacticalAudio } from '../utils/audio';

interface HeaderProps {
  missionTime: number; // in seconds
  activeDronesCount: number;
  criticalVictimsCount: number;
  totalVictimsCount: number;
  meshLatency: number;
  isOfflineMode: boolean;
  queuedSyncCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleOffline: () => void;
  onOpenPlugins: () => void;
  onOpenGitHub: () => void;
  onTriggerProximityTest: () => void;
  onSimulateNewVictim: () => void;
  onResetSimulation: () => void;
  activeTab: 'mission_control' | 'flowchart' | 'sensors' | 'communications';
  setActiveTab: (tab: 'mission_control' | 'flowchart' | 'sensors' | 'communications') => void;
}

export const Header: React.FC<HeaderProps> = ({
  missionTime,
  activeDronesCount,
  criticalVictimsCount,
  totalVictimsCount,
  meshLatency,
  isOfflineMode,
  queuedSyncCount,
  soundEnabled,
  onToggleSound,
  onToggleOffline,
  onOpenPlugins,
  onOpenGitHub,
  onTriggerProximityTest,
  onSimulateNewVictim,
  onResetSimulation,
  activeTab,
  setActiveTab,
}) => {
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 text-slate-100">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Mission Callout */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 via-sky-500/20 to-purple-500/20 border border-amber-500/40 shadow-inner">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                RESCUE SWARM
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  USAR v4.2
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-Drone Acoustic (Debris) • FLIR Thermal • 20ft Subsurface Seismic Detection
            </p>
          </div>
        </div>

        {/* Real-time telemetry indicators */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          {/* Mission clock */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400 text-[10px]">T+</span>
            <span className="font-semibold text-sky-300">{formatTime(missionTime)}</span>
          </div>

          {/* Critical Triage Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/60 border border-red-800/80 text-red-200">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span>P1 Critical:</span>
            <span className="font-bold text-red-300">{criticalVictimsCount}</span>
            <span className="text-slate-400">/ {totalVictimsCount}</span>
          </div>

          {/* Low-Latency Telemetry Meter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">Mesh RTT:</span>
            <span className="font-semibold text-emerald-400">{meshLatency.toFixed(1)}ms</span>
          </div>

          {/* Network Outage / Offline Sync Mode Toggle */}
          <button
            onClick={onToggleOffline}
            title={isOfflineMode ? "Network Outage Active: Data caching in local sync queue" : "Online: Low-latency telemetry stream active"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              isOfflineMode 
                ? 'bg-amber-950/70 border-amber-500 text-amber-300' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">OFFLINE MESH ({queuedSyncCount} queued)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>ONLINE MESH</span>
              </>
            )}
          </button>

          {/* Sound Alert Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? "Mute audio alarms" : "Enable acoustic & seismic audio alerts"}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Proximity Toast Simulator Button */}
          <button
            onClick={onTriggerProximityTest}
            title="Simulate drone approaching high-priority victim within 5 meters"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/80 border border-red-500/80 text-red-300 hover:bg-red-900/80 font-bold transition cursor-pointer shadow-sm animate-pulse"
          >
            <Crosshair className="w-3.5 h-3.5 text-red-400" />
            <span>Test 5m Alert</span>
          </button>

          {/* GitHub Repository Button */}
          <button
            onClick={onOpenGitHub}
            title="Open GitHub Repository & Push Commands"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white transition cursor-pointer"
          >
            <Github className="w-3.5 h-3.5 text-white" />
            <span>GitHub</span>
          </button>

          {/* Modular Plugins Button */}
          <button
            onClick={onOpenPlugins}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-950/70 border border-sky-600/60 text-sky-300 hover:bg-sky-900/60 transition cursor-pointer"
          >
            <Box className="w-3.5 h-3.5 text-sky-400" />
            <span>Plugins</span>
          </button>

          {/* Simulate Action buttons */}
          <button
            onClick={onSimulateNewVictim}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-600/80 hover:bg-amber-500 text-slate-950 font-bold transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-black" />
            <span>+ Rubble Event</span>
          </button>

          <button
            onClick={onResetSimulation}
            title="Reset simulation parameters"
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center space-x-1 border-t border-slate-800/80 pt-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('mission_control')}
          className={`px-3 py-2 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'mission_control'
              ? 'border-amber-500 text-amber-400 font-semibold bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Live Tactical Map & Swarm HUD
        </button>

        <button
          onClick={() => setActiveTab('flowchart')}
          className={`px-3 py-2 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'flowchart'
              ? 'border-sky-500 text-sky-400 font-semibold bg-sky-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Flow Chart Pipeline Monitoring
        </button>

        <button
          onClick={() => setActiveTab('sensors')}
          className={`px-3 py-2 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'sensors'
              ? 'border-purple-500 text-purple-400 font-semibold bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          Separate Sensor Predictions (Acoustic • Thermal • 20ft Seismic)
        </button>

        <button
          onClick={() => setActiveTab('communications')}
          className={`px-3 py-2 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'communications'
              ? 'border-emerald-500 text-emerald-400 font-semibold bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          Field Coordination & Mesh Comms
        </button>
      </div>
    </header>
  );
};
