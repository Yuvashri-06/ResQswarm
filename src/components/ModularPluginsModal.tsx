import React, { useState } from 'react';
import { 
  X, 
  Box, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  ShieldAlert, 
  Wrench, 
  Radio, 
  Layers, 
  HardDrive,
  Database,
  Share2
} from 'lucide-react';
import { EquipmentPlugin, ConnectivityPlugin, OfflineSyncItem } from '../types';
import { tacticalAudio } from '../utils/audio';

interface ModularPluginsModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentList: EquipmentPlugin[];
  connectivityList: ConnectivityPlugin[];
  isOfflineMode: boolean;
  onToggleOffline: () => void;
  queuedSyncItems: OfflineSyncItem[];
  onTriggerSync: () => void;
  onToggleEquipmentDeploy: (eqId: string) => void;
  onToggleConnectivity: (connId: string) => void;
}

export const ModularPluginsModal: React.FC<ModularPluginsModalProps> = ({
  isOpen,
  onClose,
  equipmentList,
  connectivityList,
  isOfflineMode,
  onToggleOffline,
  queuedSyncItems,
  onTriggerSync,
  onToggleEquipmentDeploy,
  onToggleConnectivity,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'equipment' | 'connectivity' | 'offline_sync'>('equipment');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                MODULAR MISSION PLUGINS & CONNECTIVITY
                <span className="px-2 py-0.2 rounded bg-sky-950 text-sky-300 font-mono text-[10px] border border-sky-800">
                  EXTENSIBLE ARCHITECTURE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Specialized USAR Hardware • Emergency Comms • Offline Mesh Data Sync
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

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 pt-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 transition cursor-pointer ${
              activeTab === 'equipment'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Specialized Disaster Equipment ({equipmentList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('connectivity')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 transition cursor-pointer ${
              activeTab === 'connectivity'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Emergency Support Connectivity</span>
          </button>

          <button
            onClick={() => setActiveTab('offline_sync')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 transition cursor-pointer ${
              activeTab === 'offline_sync'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Offline Mesh Data Sync ({queuedSyncItems.length} Queued)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs">
          {/* TAB 1: EQUIPMENT PLUGINS */}
          {activeTab === 'equipment' && (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs">
                Deploy modular heavy extrication and stabilization gear tailored to detected rubble depth and void structures.
              </p>

              <div className="space-y-3">
                {equipmentList.map(eq => (
                  <div
                    key={eq.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-xs">{eq.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 text-[10px] border border-slate-800">
                          {eq.category}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {eq.weightKg} kg • ~{eq.deploymentTimeMinutes}m deploy
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-xl">
                        {eq.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        eq.status === 'DEPLOYED' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}>
                        {eq.status}
                      </span>

                      <button
                        onClick={() => {
                          onToggleEquipmentDeploy(eq.id);
                          tacticalAudio.playAcousticTapping();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition text-xs cursor-pointer"
                      >
                        {eq.status === 'DEPLOYED' ? 'Recall to Base' : 'Deploy to Field'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CONNECTIVITY PLUGINS */}
          {activeTab === 'connectivity' && (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs">
                Ensure low-latency, resilient data transmission across the swarm and rescue teams during zero-infrastructure disaster conditions.
              </p>

              <div className="space-y-3">
                {connectivityList.map(conn => (
                  <div
                    key={conn.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-xs">{conn.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-950 text-emerald-400 text-[10px] border border-slate-800 font-bold">
                          {conn.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Protocol: <strong className="text-slate-200">{conn.protocol}</strong> • Latency: <strong className="text-emerald-400">{conn.latency} ms</strong> • Bandwidth: <strong className="text-sky-300">{conn.bandwidthKbps} Kbps</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleConnectivity(conn.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                        conn.active 
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' 
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {conn.active ? 'Active Uplink' : 'Activate Relay'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: OFFLINE DATA SYNCHRONIZATION */}
          {activeTab === 'offline_sync' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="font-bold text-white text-xs">Offline Synchronization Engine</h4>
                      <p className="text-[11px] text-slate-400">
                        Guarantees zero data loss when radio mesh drops in deep concrete or collapsed tunnels.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onToggleOffline}
                    className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                      isOfflineMode 
                        ? 'bg-amber-950 border-amber-500 text-amber-300' 
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isOfflineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
                    <span>{isOfflineMode ? 'Simulating Outage (Offline)' : 'Online Mesh Mode'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">CACHED TELEMETRY PACKETS</span>
                    <span className="text-lg font-bold text-amber-300">{queuedSyncItems.length} Updates</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">CONFLICT RESOLUTION</span>
                    <span className="text-lg font-bold text-emerald-400">CRDT Vector Clock</span>
                  </div>
                </div>

                <button
                  onClick={onTriggerSync}
                  disabled={queuedSyncItems.length === 0}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Flush Local Cache & Sync to Central Command ({queuedSyncItems.length})</span>
                </button>
              </div>

              {/* Sync Queue Table */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Recent Sync Log / Outage Cache:</span>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {queuedSyncItems.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900 text-slate-500 text-center">
                      All local packets synchronized. No pending queue items.
                    </div>
                  ) : (
                    queuedSyncItems.map(item => (
                      <div key={item.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="text-sky-300 font-bold">{item.action}</span>
                          <span className="text-slate-500 ml-2">({item.timestamp})</span>
                        </div>
                        <span className="text-[10px] text-amber-400">QUEUED LOCAL</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
