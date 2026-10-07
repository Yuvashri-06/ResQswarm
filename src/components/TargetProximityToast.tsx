import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Navigation, 
  MapPin, 
  X, 
  Volume2, 
  Flame, 
  Radio, 
  ExternalLink, 
  Zap, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { DroneTelemetry, Victim } from '../types';
import { tacticalAudio } from '../utils/audio';

export interface ProximityAlertData {
  id: string;
  drone: DroneTelemetry;
  victim: Victim;
  distanceMeters: number;
  timestamp: string;
}

interface TargetProximityToastProps {
  alerts: ProximityAlertData[];
  onDismiss: (alertId: string) => void;
  onLockHover: (droneId: string, victimId: number) => void;
  onInspectVictim: (victimId: number) => void;
}

export const TargetProximityToast: React.FC<TargetProximityToastProps> = ({
  alerts,
  onDismiss,
  onLockHover,
  onInspectVictim,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto rounded-2xl bg-slate-950/95 border-2 border-red-500 shadow-2xl shadow-red-500/25 p-4 backdrop-blur-xl animate-in slide-in-from-top-4 duration-300 relative overflow-hidden"
        >
          {/* Top glowing strobe bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-red-500 animate-pulse" />

          {/* Alert Header */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40">
                <ShieldAlert className="w-5 h-5 animate-bounce" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-red-400 font-mono">
                    TARGET PROXIMITY ALERT
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-300 font-mono text-[10px] font-bold border border-red-800">
                    &lt; 5 METERS
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {alert.timestamp} • Real-time Swarm Proximity Trigger
                </div>
              </div>
            </div>

            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alert Details Card */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                Drone:
              </span>
              <span className="font-bold text-white" style={{ color: alert.drone.color }}>
                {alert.drone.name} ({alert.drone.callsign})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                High-Priority Target:
              </span>
              <span className="font-bold text-amber-300">
                {alert.victim.codeName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Proximity Distance:</span>
              <span className="text-red-400 font-bold text-sm bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                {alert.distanceMeters.toFixed(1)} METERS
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px]">
              <span className="text-slate-400">Sensors Active:</span>
              <span className="text-sky-300">
                {alert.victim.acousticDb}dB Sound • {alert.victim.temperature}°C • {alert.victim.depthFeet}ft Deep
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={() => {
                onLockHover(alert.drone.id, alert.victim.id);
                tacticalAudio.playAcousticTapping();
                onDismiss(alert.id);
              }}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Lock Hover</span>
            </button>

            <button
              onClick={() => {
                onInspectVictim(alert.victim.id);
                onDismiss(alert.id);
              }}
              className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Inspect Triage</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
