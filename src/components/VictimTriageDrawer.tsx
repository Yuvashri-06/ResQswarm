import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Volume2, 
  Flame, 
  Radio, 
  ShieldAlert, 
  Clock, 
  Send, 
  CheckCircle2, 
  Sliders, 
  Wrench, 
  Wind, 
  Thermometer, 
  Compass, 
  AlertTriangle,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';
import { Victim } from '../types';
import { tacticalAudio } from '../utils/audio';

interface VictimTriageDrawerProps {
  victim: Victim | null;
  onClose: () => void;
  onUpdateStatus: (victimId: number, newStatus: Victim['extricationStatus'], assignedTeam?: string) => void;
  onDispatchAIAnalysis?: (victim: Victim) => void;
}

export const VictimTriageDrawer: React.FC<VictimTriageDrawerProps> = ({
  victim,
  onClose,
  onUpdateStatus,
}) => {
  if (!victim) return null;

  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);

  // Exact GPS Coordinates calculation based on map position
  const baseLat = 34.0522;
  const baseLng = -118.2437;
  const exactLat = (baseLat + (victim.y - 50) * 0.0003).toFixed(5);
  const exactLng = (baseLng + (victim.x - 50) * 0.0003).toFixed(5);
  const mgrsGrid = `11S LT ${Math.round(victim.x * 123 + 4200)} ${Math.round(victim.y * 145 + 8100)}`;

  // Environmental readings inside rubble void
  const oxygenLevel = Math.max(14.8, +(20.9 - (victim.depthFeet * 0.28)).toFixed(1));
  const structuralIntegrity = Math.max(38, Math.round(90 - victim.depthFeet * 2.4));
  const airToxicityPpm = victim.depthFeet > 10 ? 42 : 12;

  const handleDeepTriage = async () => {
    setAnalyzingAi(true);
    tacticalAudio.playAcousticTapping();

    try {
      const response = await fetch('/api/gemini/triage-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ victim, language: 'en' }),
      });
      const data = await response.json();
      setAiAnalysisResult(data.triage);
    } catch (err) {
      console.warn('AI Triage request failed, using local result:', err);
    } finally {
      setAnalyzingAi(false);
    }
  };

  const getPriorityBadge = (tier: string) => {
    switch (tier) {
      case 'P1_CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'P2_HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'P3_MODERATE':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-950/95 border-l border-slate-800 shadow-2xl z-50 overflow-y-auto backdrop-blur-xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              {victim.codeName}
              <span className={`text-[10px] font-mono px-2 py-0.2 rounded border font-bold ${getPriorityBadge(victim.priorityTier)}`}>
                {victim.priorityTier.replace('_', ' ')}
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Exact Location & Multi-Sensor Triage Profile
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="p-5 space-y-5 text-xs font-mono">
        {/* Exact Location & Spatial Coordinates HUD */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Compass className="w-4 h-4 text-sky-400" /> EXACT LOCATION COORDINATES
            </span>
            <span className="text-emerald-400 font-bold">GPS LOCKED</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">LATITUDE / LONGITUDE</span>
              <span className="text-sky-300 font-bold">{exactLat}° N, {exactLng}° W</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">MGRS GRID / USAR REF</span>
              <span className="text-slate-200 font-bold">{mgrsGrid}</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-purple-500/30">
              <span className="text-purple-400 text-[10px] block">SUBSURFACE DEPTH</span>
              <span className="text-purple-300 font-bold">{victim.depthFeet} FT ({(victim.depthFeet * 0.3048).toFixed(1)}m)</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">DEBRIS COMPOSITION</span>
              <span className="text-amber-300 font-bold truncate">{victim.debrisType}</span>
            </div>
          </div>
        </div>

        {/* 3 Specialized Drones Sensor Telemetry Breakdown */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Tripartite Swarm Sensor Readings
          </div>

          {/* Drone 1: Sound detection under debris */}
          <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-sky-400" /> DRONE 01: Sound Detection Under Debris
              </span>
              <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px]">
                {victim.acousticConfidence}% Confidence
              </span>
            </div>
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Intensity: <strong className="text-white">{victim.acousticDb} dB</strong></span>
              <span>Frequency: <strong className="text-sky-300">{victim.acousticHz} Hz</strong></span>
              <span>Pattern: <strong className="text-emerald-400">{victim.acousticPattern}</strong></span>
            </div>
          </div>

          {/* Drone 2: Temperature detection */}
          <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-orange-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" /> DRONE 02: FLIR Thermal Temperature
              </span>
              <span className="px-1.5 py-0.2 rounded bg-orange-950 text-orange-300 border border-orange-800 text-[10px]">
                {victim.thermalConfidence}% Confidence
              </span>
            </div>
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Core Temp: <strong className={victim.temperature < 34 ? 'text-red-400' : 'text-white'}>{victim.temperature}°C</strong></span>
              <span>Rubble Ambient: <strong className="text-slate-300">{victim.ambientTemp}°C</strong></span>
              <span>Delta-T: <strong className="text-emerald-400">+{victim.thermalGradientDelta.toFixed(1)}°C</strong></span>
            </div>
          </div>

          {/* Drone 3: Vibration detection under 20ft distance */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-purple-400" /> DRONE 03: 20-Foot Subsurface Seismic Radar
              </span>
              <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px]">
                {victim.seismicConfidence}% Confidence
              </span>
            </div>
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Depth: <strong className="text-purple-300">{victim.depthFeet} FT / 20FT</strong></span>
              <span>Micro-vibration: <strong className="text-white">{victim.vibrationHz} Hz</strong></span>
              <span>Amplitude: <strong className="text-emerald-400">{victim.vibrationAmplitude} mm/s</strong></span>
            </div>
          </div>
        </div>

        {/* Key Environmental Conditions in Rubble Void */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            Void Cavity Environmental Status
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block">OXYGEN CONC.</span>
              <span className={`font-bold text-xs ${oxygenLevel < 18 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {oxygenLevel}%
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block">SLAB STABILITY</span>
              <span className={`font-bold text-xs ${structuralIntegrity < 50 ? 'text-red-400' : 'text-sky-300'}`}>
                {structuralIntegrity}%
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block">AIR TOXICITY</span>
              <span className="font-bold text-xs text-slate-300">
                {airToxicityPpm} PPM
              </span>
            </div>
          </div>
        </div>

        {/* AI Deep Survivability Prognosis */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Survivability Prognosis
            </span>
            <button
              onClick={handleDeepTriage}
              disabled={analyzingAi}
              className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition cursor-pointer text-[10px]"
            >
              {analyzingAi ? 'Calculating...' : 'Recalculate AI Triage'}
            </button>
          </div>

          <div className="text-[11px] text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Golden Hour Survival:</span>
              <span className="text-amber-300 font-bold">~{aiAnalysisResult?.survivabilityWindowHours || victim.estimatedSurvivingHours} hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Safe Breaching Angle:</span>
              <span className="text-sky-300 font-semibold">{aiAnalysisResult?.safeBreachingVector || victim.safeBreachVector}</span>
            </div>
          </div>
        </div>

        {/* Companion Command Actions for Field Coordinator */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-[11px] font-bold text-white uppercase tracking-wider">
            Coordinator Field Dispatch Actions
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onUpdateStatus(victim.id, 'Access Route Cleared', 'USAR Team Alpha');
                tacticalAudio.playPriorityAlert();
              }}
              className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-center transition cursor-pointer shadow-md"
            >
              Dispatch USAR Alpha
            </button>

            <button
              onClick={() => {
                onUpdateStatus(victim.id, 'Breaching Void', 'USAR Team Beta');
                tacticalAudio.playPriorityAlert();
              }}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-center transition cursor-pointer shadow-md"
            >
              Dispatch USAR Beta
            </button>
          </div>

          <button
            onClick={() => {
              onUpdateStatus(victim.id, 'Extricated');
              tacticalAudio.playAcousticTapping();
            }}
            className="w-full p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Mark Survivor Successfully Extricated
          </button>
        </div>
      </div>
    </div>
  );
};
