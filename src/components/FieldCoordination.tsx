import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  Wifi, 
  Signal, 
  ShieldAlert, 
  Users, 
  Clock, 
  CheckCheck, 
  Share2, 
  Activity,
  ArrowUpDown
} from 'lucide-react';
import { RadioMessage } from '../types';

interface FieldCoordinationProps {
  messages: RadioMessage[];
  onSendMessage: (text: string, priority: 'ROUTINE' | 'TACTICAL' | 'CRITICAL', sender: string) => void;
  meshLatency: number;
}

export const FieldCoordination: React.FC<FieldCoordinationProps> = ({
  messages,
  onSendMessage,
  meshLatency,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'ROUTINE' | 'TACTICAL' | 'CRITICAL'>('TACTICAL');
  const [selectedSender, setSelectedSender] = useState<'INCIDENT_COMMAND' | 'USAR_TEAM_ALPHA' | 'USAR_TEAM_BETA'>('INCIDENT_COMMAND');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), selectedPriority, selectedSender);
    setInputText('');
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse';
      case 'TACTICAL':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Low-Latency Mesh Transmission Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>MESH RTT LATENCY</span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {meshLatency.toFixed(1)} ms
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Ultra low-latency P2P mesh relay
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>PACKET DELIVERY</span>
            <CheckCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-300">
            99.98 %
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            0.02% Packet Loss (INSARAG Spec)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>CONNECTED NODES</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            8 Units
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            3 Drones + 2 USAR Teams + 3 Comms Relays
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>NETWORK PROTOCOL</span>
            <Share2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold font-mono text-amber-300 mt-1">
            LoRa + HaLow Relay
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Zero-infrastructure mesh topology
          </div>
        </div>
      </div>

      {/* Main Radio Communications Console */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="font-bold text-white uppercase tracking-wider font-mono">
              TACTICAL FIELD COMMUNICATIONS LOG // REAL-TIME DISPATCH
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            SECURE CHANNEL 04 - ENCRYPTED
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-1.5 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sky-300">{msg.senderLabel}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{msg.timestamp}</span>
                </div>

                <span className={`px-2 py-0.2 rounded border text-[9px] font-bold ${getPriorityBadge(msg.priority)}`}>
                  {msg.priority}
                </span>
              </div>

              <p className="text-slate-200 leading-relaxed text-xs">
                {msg.text}
              </p>
            </div>
          ))}
        </div>

        {/* Dispatch Message Input */}
        <div className="p-3.5 bg-slate-900/90 border-t border-slate-800">
          <form onSubmit={handleSend} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Transmitting As:</span>
                <select
                  value={selectedSender}
                  onChange={(e: any) => setSelectedSender(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none cursor-pointer"
                >
                  <option value="INCIDENT_COMMAND">Incident Command Base</option>
                  <option value="USAR_TEAM_ALPHA">USAR Ground Team Alpha</option>
                  <option value="USAR_TEAM_BETA">USAR Ground Team Beta</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Priority:</span>
                {(['ROUTINE', 'TACTICAL', 'CRITICAL'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPriority(p)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                      selectedPriority === p
                        ? p === 'CRITICAL' ? 'bg-red-500 text-slate-950 border-red-400' : 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Broadcast mission-critical tactical radio dispatch to swarm and rescue teams..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-400"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <span>Transmit</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
