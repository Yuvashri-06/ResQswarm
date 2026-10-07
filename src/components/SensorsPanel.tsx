import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Flame, 
  Radio, 
  Activity, 
  Cpu, 
  Play, 
  Square, 
  ShieldAlert, 
  BarChart3, 
  Zap, 
  CheckCircle2, 
  Clock,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Victim, DroneTelemetry } from '../types';
import { tacticalAudio } from '../utils/audio';

interface SensorsPanelProps {
  victims: Victim[];
  drones: DroneTelemetry[];
  selectedVictimId: number | null;
  onSelectVictim: (id: number) => void;
}

export const SensorsPanel: React.FC<SensorsPanelProps> = ({
  victims,
  drones,
  selectedVictimId,
  onSelectVictim,
}) => {
  const [activeSensorTab, setActiveSensorTab] = useState<'acoustic' | 'thermal' | 'seismic' | 'fusion'>('acoustic');
  const [isPlayingAudioSim, setIsPlayingAudioSim] = useState(false);
  const [thermalPalette, setThermalPalette] = useState<'ironbow' | 'whitehot' | 'rainbow'>('ironbow');
  const [bandpassFilter, setBandpassFilter] = useState(true);

  // Active victim for detailed sensor graphs
  const currentVictim = victims.find(v => v.id === selectedVictimId) || victims[0];

  // Canvas refs for animated waveforms
  const acousticCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const seismicCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const thermalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated Acoustic Waveform loop
  useEffect(() => {
    let animId: number;
    let phase = 0;

    const renderAcoustic = () => {
      const canvas = acousticCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw acoustic wave
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#38bdf8'; // Sky cyan

      const freq = (currentVictim?.acousticHz || 800) / 100;
      const amp = (currentVictim?.acousticDb || 45) / 2;

      for (let x = 0; x < w; x++) {
        // Compose knocking tap pulse with background rubble noise
        const tapPulse = Math.sin((x / 30) - phase * 2);
        const tapEnvelope = Math.max(0, Math.sin((x / 60) - phase));
        const noise = (Math.random() - 0.5) * (bandpassFilter ? 4 : 18);
        const y = (h / 2) + (Math.sin((x * freq * 0.04) + phase) * amp * tapEnvelope * 0.6) + noise;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw peaks & labels
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px monospace';
      ctx.fillText(`Peak Tapping: ${currentVictim?.acousticHz || 840}Hz @ ${currentVictim?.acousticDb || 58}dB`, 10, 18);

      phase += 0.06;
      animId = requestAnimationFrame(renderAcoustic);
    };

    renderAcoustic();
    return () => cancelAnimationFrame(animId);
  }, [currentVictim, bandpassFilter]);

  // Animated Seismic Waveform loop (Drone 3)
  useEffect(() => {
    let animId: number;
    let phase = 0;

    const renderSeismic = () => {
      const canvas = seismicCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Geophone micro-vibration wave
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#c084fc'; // Purple

      const vAmp = (currentVictim?.vibrationAmplitude || 0.5) * 35;
      const vHz = currentVictim?.vibrationHz || 1.8;

      for (let x = 0; x < w; x++) {
        // Subsurface ground impulse profile (deep tapping)
        const geophoneImpulse = Math.sin((x * vHz * 0.05) + phase);
        const groundDamping = Math.exp(-((x % 80) / 40));
        const y = (h / 2) + (geophoneImpulse * vAmp * groundDamping);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px monospace';
      ctx.fillText(`Subsurface Geophone: ${currentVictim?.depthFeet || 18.2}ft depth | ${currentVictim?.vibrationHz || 1.8}Hz knock`, 10, 18);

      phase += 0.04;
      animId = requestAnimationFrame(renderSeismic);
    };

    renderSeismic();
    return () => cancelAnimationFrame(animId);
  }, [currentVictim]);

  // Draw Thermal Heatmap Canvas (Drone 2)
  useEffect(() => {
    const canvas = thermalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Create radial thermal gradient representing trapped body core
    const cx = w / 2;
    const cy = h / 2;
    const radius = 90;

    const radGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);

    if (thermalPalette === 'ironbow') {
      radGrad.addColorStop(0, '#ffffff'); // Hottest core (white)
      radGrad.addColorStop(0.2, '#fde047'); // Yellow (36°C)
      radGrad.addColorStop(0.5, '#ea580c'); // Orange (32°C)
      radGrad.addColorStop(0.8, '#7e22ce'); // Purple (18°C)
      radGrad.addColorStop(1, '#0f172a'); // Cold concrete (12°C)
    } else if (thermalPalette === 'whitehot') {
      radGrad.addColorStop(0, '#ffffff');
      radGrad.addColorStop(0.5, '#94a3b8');
      radGrad.addColorStop(1, '#020617');
    } else {
      // Rainbow palette
      radGrad.addColorStop(0, '#ef4444');
      radGrad.addColorStop(0.3, '#f59e0b');
      radGrad.addColorStop(0.6, '#10b981');
      radGrad.addColorStop(1, '#1e1b4b');
    }

    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

    // Draw FLIR Crosshair & Isotherm temperature reading
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy);
    ctx.lineTo(cx + 20, cy);
    ctx.moveTo(cx, cy - 20);
    ctx.lineTo(cx, cy + 20);
    ctx.stroke();

    // Isotherm box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(cx + 12, cy - 35, 120, 24);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(cx + 12, cy - 35, 120, 24);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${currentVictim?.temperature || 34.6}°C CORE`, cx + 18, cy - 19);
  }, [currentVictim, thermalPalette]);

  const handleToggleAudioPlay = () => {
    if (isPlayingAudioSim) {
      setIsPlayingAudioSim(false);
    } else {
      setIsPlayingAudioSim(true);
      tacticalAudio.playAcousticTapping();
      setTimeout(() => {
        setIsPlayingAudioSim(false);
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Selector Pill Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-white">Inspecting Survivor Multi-Sensor Telemetry:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {victims.map(v => (
            <button
              key={v.id}
              onClick={() => {
                onSelectVictim(v.id);
                tacticalAudio.playAcousticTapping();
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer border ${
                v.id === currentVictim.id
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              #{v.id}: {v.codeName.split(' ')[0]} ({v.depthFeet}ft)
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Switcher Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveSensorTab('acoustic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
            activeSensorTab === 'acoustic'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Volume2 className="w-4 h-4 text-sky-400" />
          <span>DRONE 01: Sound / Acoustic (Debris)</span>
          <span className="px-1.5 py-0.2 rounded bg-sky-950 text-[10px] text-sky-300 border border-sky-800">
            {currentVictim.acousticConfidence}% Conf
          </span>
        </button>

        <button
          onClick={() => setActiveSensorTab('thermal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
            activeSensorTab === 'thermal'
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-400" />
          <span>DRONE 02: Temperature (FLIR Thermal)</span>
          <span className="px-1.5 py-0.2 rounded bg-orange-950 text-[10px] text-orange-300 border border-orange-800">
            {currentVictim.thermalConfidence}% Conf
          </span>
        </button>

        <button
          onClick={() => setActiveSensorTab('seismic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
            activeSensorTab === 'seismic'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Radio className="w-4 h-4 text-purple-400" />
          <span>DRONE 03: Vibration (20ft Distance)</span>
          <span className="px-1.5 py-0.2 rounded bg-purple-950 text-[10px] text-purple-300 border border-purple-800">
            {currentVictim.seismicConfidence}% Conf
          </span>
        </button>

        <button
          onClick={() => setActiveSensorTab('fusion')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
            activeSensorTab === 'fusion'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4 text-amber-400" />
          <span>Ensemble AI Triage Matrix</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-950 text-[10px] text-amber-300 border border-amber-800">
            Priority {currentVictim.priorityScore}/100
          </span>
        </button>
      </div>

      {/* SENSOR 1: ACOUSTIC / SOUND DETECTION (DRONE 1) */}
      {activeSensorTab === 'acoustic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-sky-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-sky-300 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Drone-01 Acoustic Oscilloscope & Spectrum Analyzer
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Microphone array beamforming audio penetrating through collapsed reinforced concrete slabs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBandpassFilter(!bandpassFilter)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition cursor-pointer ${
                    bandpassFilter ? 'bg-sky-500/20 text-sky-300 border-sky-500/50' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {bandpassFilter ? 'Bandpass 300-3400Hz (Active)' : 'Raw Rubble Noise'}
                </button>
              </div>
            </div>

            {/* Canvas Waveform */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-52">
              <canvas
                ref={acousticCanvasRef}
                width={700}
                height={208}
                className="w-full h-full block"
              />
            </div>

            {/* Audio Synthesis Playback Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleAudioPlay}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-sky-500/20"
                >
                  {isPlayingAudioSim ? (
                    <>
                      <Square className="w-4 h-4 fill-slate-950" />
                      <span>Synthesizing Rubble Tapping...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Listen to Rubble Knock Echo (Audio Simulation)</span>
                    </>
                  )}
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  Pattern: <strong className="text-sky-300">{currentVictim.acousticPattern}</strong>
                </span>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Coherence SNR: <span className="text-emerald-400 font-bold">+18.4 dB</span>
              </div>
            </div>
          </div>

          {/* Drone 1 Acoustic AI Prediction Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-400">ACOUSTIC AI CLASSIFIER</span>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-xs font-bold border border-sky-500/30">
                Confidence {currentVictim.acousticConfidence}%
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">DETECTED FREQUENCY</div>
                <div className="text-sm font-bold text-sky-300">{currentVictim.acousticHz} Hz</div>
                <div className="text-[10px] text-slate-500">Human vocal / kinetic tapping resonant band</div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">SOUND INTENSITY</div>
                <div className="text-sm font-bold text-white">{currentVictim.acousticDb} dB Sound Level</div>
                <div className="text-[10px] text-slate-500">Compensated for 400mm concrete slab attenuation</div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">REPETITION CADENCE</div>
                <div className="text-sm font-bold text-emerald-400">1.8s Interval (Intelligent Signal)</div>
                <div className="text-[10px] text-slate-500">Eliminates random rubble settling or wind noise</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200">
              <strong className="text-white">Drone-01 Triage Verdict:</strong> Confirmed conscious survivor tapping against concrete rebar. High extrication priority.
            </div>
          </div>
        </div>
      )}

      {/* SENSOR 2: TEMPERATURE / FLIR THERMAL (DRONE 2) */}
      {activeSensorTab === 'thermal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-orange-500/30 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-orange-300 flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  Drone-02 FLIR Radiometric Thermal Heatmap
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-definition thermal infrared detection tracking core temperature and hypothermia trajectory.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {(['ironbow', 'whitehot', 'rainbow'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setThermalPalette(p)}
                    className={`px-2 py-1 rounded text-[11px] font-mono capitalize border transition cursor-pointer ${
                      thermalPalette === p ? 'bg-orange-500 text-slate-950 font-bold border-orange-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Thermal Canvas */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-52">
              <canvas
                ref={thermalCanvasRef}
                width={700}
                height={208}
                className="w-full h-full block"
              />
            </div>

            {/* Thermal Stats Bar */}
            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px]">CORE BODY TEMP:</span>
                <div className={`text-base font-bold ${currentVictim.temperature < 34 ? 'text-red-400' : 'text-orange-300'}`}>
                  {currentVictim.temperature}°C
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px]">RUBBLE AMBIENT:</span>
                <div className="text-base font-bold text-slate-300">{currentVictim.ambientTemp}°C</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px]">THERMAL DELTA-T:</span>
                <div className="text-base font-bold text-emerald-400">+{currentVictim.thermalGradientDelta.toFixed(1)}°C</div>
              </div>
            </div>
          </div>

          {/* Drone 2 Thermal AI Prediction Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-400">THERMAL AI CLASSIFIER</span>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-mono text-xs font-bold border border-orange-500/30">
                Confidence {currentVictim.thermalConfidence}%
              </span>
            </div>

            {/* Hypothermia Risk Warning */}
            <div className={`p-3 rounded-lg border text-xs space-y-1 ${
              currentVictim.temperature < 33 
                ? 'bg-red-950/70 border-red-500 text-red-200' 
                : currentVictim.temperature < 35 
                ? 'bg-amber-950/70 border-amber-500 text-amber-200' 
                : 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
            }`}>
              <div className="font-bold uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                {currentVictim.temperature < 33 ? 'CRITICAL HYPOTHERMIA ALERT' : currentVictim.temperature < 35 ? 'MILD HYPOTHERMIA ONSET' : 'NORMOTHERMIC STABLE'}
              </div>
              <p className="text-[11px] leading-relaxed">
                {currentVictim.temperature < 34 
                  ? 'Victim is rapidly losing body heat in cold rubble. Immediate active rewarming blanket required during extrication.'
                  : 'Surface heat dissipation indicates sustained metabolic activity.'}
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Radiometric NETD:</span>
                <span className="text-slate-200">&lt; 35 mK</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Isotherm Gradient:</span>
                <span className="text-slate-200">High Contrast (+21°C)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cooling Rate:</span>
                <span className="text-amber-300">-0.6°C / hour</span>
              </div>
            </div>

            <button
              onClick={() => tacticalAudio.playThermalLock()}
              className="w-full py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-mono font-bold transition cursor-pointer"
            >
              Test Radiometric Lock Beep
            </button>
          </div>
        </div>
      )}

      {/* SENSOR 3: 20-FOOT SUBSURFACE SEISMIC VIBRATION (DRONE 3) */}
      {activeSensorTab === 'seismic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
                  <Radio className="w-5 h-5" />
                  Drone-03 20-Foot Subsurface Geophone & Micro-Vibration Radar
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ground-penetrating acoustic impulse radar penetrating down to <span className="text-purple-300 font-bold">20.0 feet (6.1 meters)</span> to detect kinetic vibrations and heartbeat pulses.
                </p>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-700">
                Depth: {currentVictim.depthFeet} FT / 20.0 FT MAX
              </span>
            </div>

            {/* Seismic Wave Canvas */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-52">
              <canvas
                ref={seismicCanvasRef}
                width={700}
                height={208}
                className="w-full h-full block"
              />
            </div>

            {/* Depth Strata Visual Meter (0 to 20 feet cross-section) */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">SURFACE 0.0 FT</span>
                <span className="text-purple-300 font-bold">VICTIM AT {currentVictim.depthFeet} FT</span>
                <span className="text-slate-400">MAX 20.0 FT</span>
              </div>

              {/* Progress bar representing 20-foot ground depth */}
              <div className="relative w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${(currentVictim.depthFeet / 20) * 100}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                />
                <div
                  style={{ left: `${(currentVictim.depthFeet / 20) * 100}%` }}
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-purple-500 -ml-0.5"
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0-5ft: Surface Debris</span>
                <span>5-12ft: Reinforced Concrete</span>
                <span>12-18ft: Void Pocket Rubble</span>
                <span>18-20ft: Deep Basement Slab</span>
              </div>
            </div>
          </div>

          {/* Drone 3 Seismic AI Prediction Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-400">SEISMIC 20FT AI CLASSIFIER</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
                Confidence {currentVictim.seismicConfidence}%
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">PENETRATION DISTANCE</div>
                <div className="text-sm font-bold text-purple-300">{currentVictim.depthFeet} Feet Below Rubble</div>
                <div className="text-[10px] text-slate-500">{(currentVictim.depthFeet * 0.3048).toFixed(2)} meters subsurface</div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">MICRO-VIBRATION FREQUENCY</div>
                <div className="text-sm font-bold text-white">{currentVictim.vibrationHz} Hz Tremor</div>
                <div className="text-[10px] text-slate-500">Amplitude: {currentVictim.vibrationAmplitude} mm/s</div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">DEBRIS COMPOSITION</div>
                <div className="text-sm font-bold text-amber-300">{currentVictim.debrisType}</div>
                <div className="text-[10px] text-slate-500">Acoustic impedance: 8.2 MRayl</div>
              </div>
            </div>

            <button
              onClick={() => tacticalAudio.playSeismicPulse()}
              className="w-full py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold transition cursor-pointer"
            >
              Simulate Subsurface Seismic Pulse
            </button>
          </div>
        </div>
      )}

      {/* SENSOR 4: ENSEMBLE AI TRIAGE MATRIX & TIME REDUCTION FORMULA */}
      {activeSensorTab === 'fusion' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-4">
            <div>
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Rescue Swarm Multi-Sensor Fusion & Priority Calculation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                How combining Drone 1 (Sound), Drone 2 (Temp), and Drone 3 (20ft Vibration) cuts disaster triage time by 74%.
              </p>
            </div>

            {/* Mathematical Formula Explanation */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
              <div className="text-slate-400 text-[11px]">TRIAGE SCORE ALGORITHM:</div>
              <div className="p-3 rounded bg-slate-900/90 border border-slate-700 text-sky-300 text-xs leading-relaxed overflow-x-auto">
                <code>
                  P(Victim) = 0.35 × S_acoustic(dB, Hz) + 0.30 × T_hypothermia(Δ°C) + 0.25 × V_seismic(20ft Depth) + 0.10 × Time_trapped
                </code>
              </div>

              {/* Individual Weight Breakdown for Selected Victim */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-sky-500/30">
                  <div className="text-sky-400 font-bold">1. Acoustic Score: 35%</div>
                  <div className="text-slate-300 mt-1">{currentVictim.acousticDb}dB tapping = 33.6 pts</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-orange-500/30">
                  <div className="text-orange-400 font-bold">2. Thermal Score: 30%</div>
                  <div className="text-slate-300 mt-1">{currentVictim.temperature}°C = 27.5 pts</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-purple-500/30">
                  <div className="text-purple-400 font-bold">3. 20ft Seismic: 25%</div>
                  <div className="text-slate-300 mt-1">{currentVictim.depthFeet}ft depth = 24.2 pts</div>
                </div>
              </div>
            </div>

            {/* Traditional vs Rescue Swarm Time Comparison */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Search & Triage Time Reduction Benchmark
              </h4>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Traditional Search (Canines & Foot Listening Probes):</span>
                    <span className="text-red-400 font-bold">185 Minutes</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-red-500/80 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Rescue Swarm 3-Drone Autonomous Ingestion:</span>
                    <span className="text-emerald-400 font-bold">12.4 Minutes (93% Reduction!)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[7%] h-full bg-emerald-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Priority Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="text-center p-4 rounded-xl bg-slate-950 border border-amber-500/40">
              <span className="text-xs font-mono text-slate-400 uppercase">CALCULATED PRIORITY INDEX</span>
              <div className="text-4xl font-extrabold text-amber-300 font-mono my-1">
                {currentVictim.priorityScore}
                <span className="text-lg text-slate-500 font-normal"> / 100</span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-mono ${
                currentVictim.priorityTier === 'P1_CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
              }`}>
                {currentVictim.priorityTier.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Estimated Survivability:</span>
                <span className="text-amber-300 font-bold">~{currentVictim.estimatedSurvivingHours} hours</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Trapped Elapsed:</span>
                <span className="text-slate-200">{currentVictim.trappedMinutes} minutes</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Safe Breach Vector:</span>
                <span className="text-sky-300">{currentVictim.safeBreachVector}</span>
              </div>
            </div>

            <button
              onClick={() => tacticalAudio.playPriorityAlert()}
              className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-red-500/20"
            >
              Sound Urgent Triage Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
