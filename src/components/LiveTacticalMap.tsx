import React, { useState } from 'react';
import { 
  Crosshair, 
  Layers, 
  MapPin, 
  Navigation, 
  Radio, 
  ShieldAlert, 
  Volume2, 
  Flame, 
  Zap, 
  Compass, 
  ZoomIn, 
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { DroneTelemetry, Victim } from '../types';
import { tacticalAudio } from '../utils/audio';

interface LiveTacticalMapProps {
  drones: DroneTelemetry[];
  victims: Victim[];
  selectedVictimId: number | null;
  onSelectVictim: (victimId: number) => void;
  onFocusDroneOnVictim: (droneId: string, victimId: number) => void;
  onTriggerMapPing: (x: number, y: number) => void;
}

export const LiveTacticalMap: React.FC<LiveTacticalMapProps> = ({
  drones,
  victims,
  selectedVictimId,
  onSelectVictim,
  onFocusDroneOnVictim,
  onTriggerMapPing,
}) => {
  const [activeLayers, setActiveLayers] = useState({
    acousticBeam: true,
    thermalField: true,
    seismicWave20ft: true,
    rubbleSectors: true,
    gridOverlay: true,
  });

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [clickPing, setClickPing] = useState<{ x: number; y: number } | null>(null);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setClickPing({ x, y });
    tacticalAudio.playAcousticTapping();
    onTriggerMapPing(x, y);

    setTimeout(() => {
      setClickPing(null);
    }, 2000);
  };

  const getPriorityBadgeClass = (tier: string) => {
    switch (tier) {
      case 'P1_CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/50 shadow-red-500/30';
      case 'P2_HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/30';
      case 'P3_MODERATE':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <div className="relative rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[640px]">
      {/* Map Header Toolbar */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs z-20">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span className="font-bold tracking-wider text-slate-100 uppercase font-mono">
            DISASTER OPERATIONAL GRID // SECTOR ALPHA - DELTA
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            Scale 1:250 • 20ft Subsurface Penetration
          </span>
        </div>

        {/* Multi-Sensor Layer Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => toggleLayer('acousticBeam')}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition cursor-pointer flex items-center gap-1 ${
              activeLayers.acousticBeam
                ? 'bg-sky-950/80 border-sky-400 text-sky-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Volume2 className="w-3 h-3" />
            <span>D1 Acoustic</span>
          </button>

          <button
            onClick={() => toggleLayer('thermalField')}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition cursor-pointer flex items-center gap-1 ${
              activeLayers.thermalField
                ? 'bg-orange-950/80 border-orange-400 text-orange-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>D2 Thermal</span>
          </button>

          <button
            onClick={() => toggleLayer('seismicWave20ft')}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition cursor-pointer flex items-center gap-1 ${
              activeLayers.seismicWave20ft
                ? 'bg-purple-950/80 border-purple-400 text-purple-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>D3 Seismic 20ft</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-950 rounded border border-slate-800 ml-1">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.45))}
              className="p-1 hover:text-white text-slate-400 transition cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] font-mono text-slate-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.85))}
              className="p-1 hover:text-white text-slate-400 transition cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div 
        onClick={handleMapClick}
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        className="relative flex-1 bg-slate-950 cursor-crosshair overflow-hidden select-none transition-transform duration-200"
      >
        {/* Tactical Grid Background */}
        <div className="absolute inset-0 tactical-grid opacity-40 pointer-events-none" />

        {/* Rubble Sectors & Collapsed Buildings Overlay */}
        {activeLayers.rubbleSectors && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Sector Alpha Rubble Zone */}
            <div className="absolute top-[20%] left-[12%] w-[38%] h-[32%] rounded-3xl border border-amber-500/20 bg-amber-500/5 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono text-amber-400/80">
                <span className="font-bold">SECTOR ALPHA // COLLAPSED PARKING SLAB</span>
                <span>Depth: 18.5ft Rubble</span>
              </div>
              <div className="text-[9px] font-mono text-slate-500">
                Reinforced 400mm Concrete Slabs • Severe Void Entrapment
              </div>
            </div>

            {/* Sector Bravo Residential Tower Collapse */}
            <div className="absolute top-[15%] right-[10%] w-[34%] h-[38%] rounded-3xl border border-orange-500/20 bg-orange-500/5 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono text-orange-400/80">
                <span className="font-bold">SECTOR BRAVO // RESIDENTIAL VOIDS</span>
                <span>Hypothermia Risk Zone</span>
              </div>
              <div className="text-[9px] font-mono text-slate-500">
                Crushed Masonry & Drywall Pockets • Ambient 12°C
              </div>
            </div>

            {/* Sector Charlie Commercial Plaza Core */}
            <div className="absolute bottom-[10%] left-[25%] w-[32%] h-[32%] rounded-3xl border border-purple-500/20 bg-purple-500/5 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono text-purple-400/80">
                <span className="font-bold">SECTOR CHARLIE // PLAZA STEEL CORE</span>
                <span>Twisted I-Beams</span>
              </div>
              <div className="text-[9px] font-mono text-slate-500">
                High Micro-Vibration Resonance • 20ft Bedrock
              </div>
            </div>

            {/* Sector Delta Subway Transit Tunnel */}
            <div className="absolute bottom-[8%] right-[8%] w-[28%] h-[34%] rounded-3xl border border-sky-500/20 bg-sky-500/5 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono text-sky-400/80">
                <span className="font-bold">SECTOR DELTA // SUBWAY VOID</span>
                <span>Max Depth: 19.4ft</span>
              </div>
              <div className="text-[9px] font-mono text-slate-500">
                Deep Underground Tunnel Shaft • Acoustic Echo Field
              </div>
            </div>
          </div>
        )}

        {/* User Click Ping animation */}
        {clickPing && (
          <div
            style={{ left: `${clickPing.x}%`, top: `${clickPing.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
          >
            <span className="absolute w-12 h-12 -left-6 -top-6 rounded-full border-2 border-amber-400 animate-ping" />
            <span className="absolute w-20 h-20 -left-10 -top-10 rounded-full border border-amber-500/60 animate-ping" style={{ animationDelay: '0.2s' }} />
            <div className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-mono font-bold whitespace-nowrap shadow-md">
              Acoustic Ping Broadcast ({clickPing.x}%, {clickPing.y}%)
            </div>
          </div>
        )}

        {/* Drone 1: Acoustic Radar Beam (Cyan cone) */}
        {activeLayers.acousticBeam && (
          <div
            style={{ left: `${drones[0].x}%`, top: `${drones[0].y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000"
          >
            {/* Pulsing acoustic ring */}
            <div className="w-40 h-40 -ml-20 -mt-20 rounded-full border border-sky-400/40 bg-sky-500/5 animate-pulse" />
            <div className="w-64 h-64 -ml-32 -mt-32 rounded-full border border-sky-500/20" />
            {/* Directional beam cone */}
            <div
              style={{ transform: `rotate(${drones[0].headingDeg}deg)` }}
              className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[80px] border-b-sky-400/15 -ml-[35px] -mt-[80px] blur-[1px]"
            />
          </div>
        )}

        {/* Drone 2: Thermal Radiometric Field (Orange heatmap circle) */}
        {activeLayers.thermalField && (
          <div
            style={{ left: `${drones[1].x}%`, top: `${drones[1].y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000"
          >
            <div className="w-48 h-48 -ml-24 -mt-24 rounded-full border border-orange-400/40 bg-gradient-radial from-orange-500/20 via-orange-500/5 to-transparent animate-pulse" />
            <div className="w-72 h-72 -ml-36 -mt-36 rounded-full border border-orange-500/15" />
          </div>
        )}

        {/* Drone 3: 20ft Subsurface Seismic Micro-Vibration Waves (Purple concentric rings) */}
        {activeLayers.seismicWave20ft && (
          <div
            style={{ left: `${drones[2].x}%`, top: `${drones[2].y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000"
          >
            <div className="w-36 h-36 -ml-18 -mt-18 rounded-full border-2 border-dashed border-purple-400/50 animate-spin" style={{ animationDuration: '14s' }} />
            <div className="w-56 h-56 -ml-28 -mt-28 rounded-full border border-purple-500/30" />
            <div className="w-80 h-80 -ml-40 -mt-40 rounded-full border border-purple-500/15" />
            <div className="text-[9px] font-mono text-purple-300 font-bold bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-700/60 -mt-20 ml-6 whitespace-nowrap">
              20FT GEOPHONE PENETRATION ACTIVE
            </div>
          </div>
        )}

        {/* Trapped Victims Markers with Priority-Based Badges */}
        {victims.map((victim) => {
          const isSelected = victim.id === selectedVictimId;
          const isCritical = victim.priorityTier === 'P1_CRITICAL';

          return (
            <div
              key={victim.id}
              style={{ left: `${victim.x}%`, top: `${victim.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectVictim(victim.id);
                tacticalAudio.playAcousticTapping();
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
            >
              {/* Outer pulsing ring for critical priority */}
              {isCritical && (
                <span className="absolute -inset-3 rounded-full bg-red-500/30 animate-ping pointer-events-none" />
              )}

              {/* Main Victim Pin */}
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                isSelected 
                  ? 'bg-amber-400 border-white ring-4 ring-amber-500/50 scale-125' 
                  : isCritical
                  ? 'bg-red-950 border-red-500 text-red-200'
                  : 'bg-slate-900 border-amber-400 text-amber-200'
              }`}>
                {/* Icon based on primary detection */}
                <Volume2 className={`w-4 h-4 ${isSelected ? 'text-slate-950' : isCritical ? 'text-red-400' : 'text-amber-300'}`} />
                
                {/* Depth Indicator Tag */}
                <span className="absolute -bottom-4 bg-slate-950/90 text-[9px] font-mono font-bold px-1 rounded border border-slate-700 text-purple-300 whitespace-nowrap">
                  {victim.depthFeet}ft deep
                </span>
              </div>

              {/* Interactive Hover HUD Popover */}
              <div className="absolute left-10 top-0 hidden group-hover:flex flex-col p-3 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl backdrop-blur-md z-30 min-w-[240px] pointer-events-auto">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-white">{victim.codeName}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-bold ${getPriorityBadgeClass(victim.priorityTier)}`}>
                    Score: {victim.priorityScore}/100
                  </span>
                </div>

                <div className="text-[10px] font-mono space-y-1 text-slate-300 border-t border-slate-800 pt-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sky-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Drone 1 Sound:
                    </span>
                    <span className="font-bold">{victim.acousticDb} dB ({victim.acousticPattern})</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-orange-400 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Drone 2 Temp:
                    </span>
                    <span className={`font-bold ${victim.temperature < 34 ? 'text-red-400' : 'text-slate-200'}`}>
                      {victim.temperature}°C {victim.temperature < 34 ? '(Hypothermia!)' : ''}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-purple-400 flex items-center gap-1">
                      <Radio className="w-3 h-3" /> Drone 3 20ft Radar:
                    </span>
                    <span className="font-bold text-purple-300">{victim.depthFeet} ft ({victim.vibrationHz}Hz)</span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Survivability Window:</span>
                    <span className="font-bold text-amber-300">~{victim.estimatedSurvivingHours} hrs remaining</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectVictim(victim.id);
                  }}
                  className="mt-2.5 w-full py-1 text-[11px] rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-center cursor-pointer"
                >
                  Inspect & Dispatch USAR Team
                </button>
              </div>
            </div>
          );
        })}

        {/* Drones Telemetry Markers */}
        {drones.map((drone) => (
          <div
            key={drone.id}
            style={{ left: `${drone.x}%`, top: `${drone.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-25 group"
          >
            {/* Drone Icon & Vector */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900/90 border-2 shadow-lg backdrop-blur-sm cursor-pointer transition-transform hover:scale-110"
              style={{ borderColor: drone.color }}
            >
              <Navigation 
                className="w-5 h-5 transition-transform" 
                style={{ color: drone.color, transform: `rotate(${drone.headingDeg}deg)` }} 
              />
              
              {/* Drone Callsign Badge */}
              <span 
                className="absolute -top-3.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-950 border text-white shadow-sm"
                style={{ borderColor: drone.color }}
              >
                {drone.callsign}
              </span>

              {/* Status Dot */}
              <span 
                className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-950 animate-ping"
                style={{ backgroundColor: drone.color }}
              />
            </div>

            {/* Drone Quick Hover Card */}
            <div className="absolute left-12 top-0 hidden group-hover:flex flex-col p-2.5 rounded-lg bg-slate-950/95 border border-slate-800 text-[10px] font-mono text-slate-300 shadow-xl min-w-[200px] pointer-events-none z-30">
              <div className="font-bold text-white flex justify-between" style={{ color: drone.color }}>
                <span>{drone.name}</span>
                <span>{drone.batteryPercent}% Batt</span>
              </div>
              <div className="text-slate-400 mt-1">{drone.sensorLabel}</div>
              <div className="text-slate-200 mt-1 font-semibold">{drone.sensorReadout}</div>
              <div className="text-[9px] text-slate-500 mt-1">
                Alt: {drone.altitudeMeters}m • Link: {drone.signalStrengthDbm}dBm ({drone.latencyMs}ms)
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Map Status Bar */}
      <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-slate-300">D1: Sound Beamformer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
            <span className="text-slate-300">D2: FLIR Radiometric</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-slate-300">D3: Subsurface 20ft Radar</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-amber-400 font-bold">Tip:</span>
          <span>Click anywhere on map to emit acoustic sonar ping or click survivor pins to inspect triage.</span>
        </div>
      </div>
    </div>
  );
};
