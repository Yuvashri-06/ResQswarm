import React, { useState, useEffect } from 'react';
import { 
  INITIAL_VICTIMS, 
  INITIAL_DRONES, 
  FLOWCHART_NODES, 
  INITIAL_RADIO_MESSAGES, 
  INITIAL_EQUIPMENT_PLUGINS, 
  INITIAL_CONNECTIVITY_PLUGINS 
} from './utils/initialData';
import { Victim, DroneTelemetry, FlowchartNode, RadioMessage, EquipmentPlugin, ConnectivityPlugin, OfflineSyncItem } from './types';
import { Header } from './components/Header';
import { LiveTacticalMap } from './components/LiveTacticalMap';
import { FlowchartMonitor } from './components/FlowchartMonitor';
import { SensorsPanel } from './components/SensorsPanel';
import { FieldCoordination } from './components/FieldCoordination';
import { AiTacticalAgent } from './components/AiTacticalAgent';
import { CommandDashboard } from './components/CommandDashboard';
import { VictimTriageDrawer } from './components/VictimTriageDrawer';
import { ModularPluginsModal } from './components/ModularPluginsModal';
import { TargetProximityToast, ProximityAlertData } from './components/TargetProximityToast';
import { GitHubExportModal } from './components/GitHubExportModal';
import { tacticalAudio } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<'mission_control' | 'flowchart' | 'sensors' | 'communications'>('mission_control');
  
  // Mission state
  const [missionTime, setMissionTime] = useState<number>(540); // 9 minutes elapsed
  const [drones, setDrones] = useState<DroneTelemetry[]>(INITIAL_DRONES);
  const [victims, setVictims] = useState<Victim[]>(INITIAL_VICTIMS);
  const [flowNodes, setFlowNodes] = useState<FlowchartNode[]>(FLOWCHART_NODES);
  const [messages, setMessages] = useState<RadioMessage[]>(INITIAL_RADIO_MESSAGES);
  const [equipmentList, setEquipmentList] = useState<EquipmentPlugin[]>(INITIAL_EQUIPMENT_PLUGINS);
  const [connectivityList, setConnectivityList] = useState<ConnectivityPlugin[]>(INITIAL_CONNECTIVITY_PLUGINS);

  // Proximity Alerts and GitHub integration
  const [proximityAlerts, setProximityAlerts] = useState<ProximityAlertData[]>([]);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);

  // Selected victim for deep-dive drawer
  const [selectedVictimId, setSelectedVictimId] = useState<number | null>(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Audio alerts & offline sync state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [queuedSyncItems, setQueuedSyncItems] = useState<OfflineSyncItem[]>([
    {
      id: 'sync-1',
      timestamp: '12:09:12',
      action: 'DRONE_3_GEOPHONE_LOG: 18.2ft depth lock confirmed',
      payload: { depth: 18.2, freq: 1.8 },
      synced: false,
    },
    {
      id: 'sync-2',
      timestamp: '12:09:44',
      action: 'DRONE_2_FLIR_LOG: Hypothermia alert threshold crossed (32.1C)',
      payload: { temp: 32.1 },
      synced: false,
    },
  ]);
  const [isPluginsModalOpen, setIsPluginsModalOpen] = useState<boolean>(false);
  const [meshLatency, setMeshLatency] = useState<number>(11.2);

  // Mission timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setMissionTime(prev => prev + 1);
      // Small jitter in mesh latency
      setMeshLatency(prev => +(11.0 + Math.random() * 2.5).toFixed(1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Drone sweeping drift simulation (gradual movement across disaster sectors)
  useEffect(() => {
    const droneDrift = setInterval(() => {
      setDrones(prevDrones =>
        prevDrones.map(d => {
          // slight oscillating drift
          const deltaX = (Math.random() - 0.5) * 1.2;
          const deltaY = (Math.random() - 0.5) * 1.2;
          const newX = Math.min(92, Math.max(8, +(d.x + deltaX).toFixed(1)));
          const newY = Math.min(92, Math.max(8, +(d.y + deltaY).toFixed(1)));
          const newHeading = (d.headingDeg + Math.round((Math.random() - 0.5) * 8) + 360) % 360;

          return {
            ...d,
            x: newX,
            y: newY,
            headingDeg: newHeading,
          };
        })
      );
    }, 2500);

    return () => clearInterval(droneDrift);
  }, []);

  // Real-time 5-Meter Target Proximity Detection
  useEffect(() => {
    victims.forEach((v) => {
      // Check high-priority trapped victims (P1_CRITICAL or priorityScore >= 80)
      if ((v.priorityTier === 'P1_CRITICAL' || v.priorityScore >= 80) && v.extricationStatus !== 'Extricated') {
        drones.forEach((d) => {
          // 1% of map is 0.5 meters (50m disaster zone)
          const distMeters = Math.hypot(d.x - v.x, d.y - v.y) * 0.5;
          if (distMeters <= 5.0) {
            setProximityAlerts((current) => {
              // Avoid duplicate toast for same drone and victim
              if (current.some((a) => a.drone.id === d.id && a.victim.id === v.id)) {
                return current;
              }
              tacticalAudio.playPriorityAlert();
              return [
                {
                  id: `alert-${Date.now()}-${d.id}-${v.id}`,
                  drone: d,
                  victim: v,
                  distanceMeters: Math.max(0.8, +distMeters.toFixed(1)),
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                },
                ...current.slice(0, 2),
              ];
            });
          }
        });
      }
    });
  }, [drones, victims]);

  const handleTriggerProximityTest = () => {
    const p1Victim = victims.find((v) => v.priorityTier === 'P1_CRITICAL') || victims[0];
    const drone1 = drones[0];
    // Position Drone 1 within 3.6 meters (7.2% distance) of Survivor 1
    const testDrone: DroneTelemetry = {
      ...drone1,
      x: +(p1Victim.x + 4.2).toFixed(1),
      y: +(p1Victim.y + 3.0).toFixed(1),
      status: 'LOCKED_TARGET',
      targetVictimId: p1Victim.id,
    };
    setDrones((prev) => prev.map((d) => (d.id === drone1.id ? testDrone : d)));

    tacticalAudio.playPriorityAlert();
    const newAlert: ProximityAlertData = {
      id: `alert-${Date.now()}`,
      drone: testDrone,
      victim: p1Victim,
      distanceMeters: 3.6, // < 5 meters!
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setProximityAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== newAlert.id)]);
  };

  // Handlers
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    tacticalAudio.setSoundEnabled(next);
  };

  const handleToggleOffline = () => {
    setIsOfflineMode(prev => {
      const next = !prev;
      if (next) {
        // Enqueue offline alert message
        const offlineMsg: RadioMessage = {
          id: `msg-${Date.now()}`,
          sender: 'AEGIS_AI',
          senderLabel: 'Swarm Mesh Gateway',
          text: 'SIMULATED OUTAGE ACTIVE: Uplink disconnected. Local storage caching all telemetry packets.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          priority: 'TACTICAL',
        };
        setMessages(m => [offlineMsg, ...m]);
      } else {
        // Auto-sync alert
        const syncMsg: RadioMessage = {
          id: `msg-${Date.now()}`,
          sender: 'AEGIS_AI',
          senderLabel: 'Swarm Mesh Gateway',
          text: `NETWORK RESTORED: Seamlessly synchronized ${queuedSyncItems.length} queued packets without telemetry loss.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          priority: 'TACTICAL',
        };
        setMessages(m => [syncMsg, ...m]);
        setQueuedSyncItems([]);
      }
      return next;
    });
  };

  const handleTriggerSync = () => {
    tacticalAudio.playAcousticTapping();
    const count = queuedSyncItems.length;
    setQueuedSyncItems([]);
    const syncMsg: RadioMessage = {
      id: `msg-${Date.now()}`,
      sender: 'AEGIS_AI',
      senderLabel: 'Swarm Mesh Sync Engine',
      text: `Flushed and committed ${count} cached telemetry updates to central mission database.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      priority: 'TACTICAL',
    };
    setMessages(m => [syncMsg, ...m]);
  };

  const handleSelectVictim = (victimId: number) => {
    setSelectedVictimId(victimId);
    setIsDrawerOpen(true);
  };

  const handleFocusDroneOnVictim = (droneId: string, victimId: number) => {
    const target = victims.find(v => v.id === victimId);
    if (!target) return;

    setDrones(prev =>
      prev.map(d => {
        if (d.id === droneId) {
          return {
            ...d,
            x: target.x,
            y: target.y,
            status: 'LOCKED_TARGET',
            targetVictimId: victimId,
          };
        }
        return d;
      })
    );
  };

  const handleTriggerMapPing = (x: number, y: number) => {
    if (isOfflineMode) {
      setQueuedSyncItems(prev => [
        {
          id: `sync-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: `ACOUSTIC_PING_EMITTED: (${x}%, ${y}%)`,
          payload: { x, y },
          synced: false,
        },
        ...prev,
      ]);
    }
  };

  const handleUpdateStatus = (
    victimId: number, 
    newStatus: Victim['extricationStatus'], 
    assignedTeam?: string
  ) => {
    setVictims(prev =>
      prev.map(v => {
        if (v.id === victimId) {
          return {
            ...v,
            extricationStatus: newStatus,
            assignedTeam: assignedTeam !== undefined ? assignedTeam : v.assignedTeam,
            priorityTier: newStatus === 'Extricated' ? 'P4_EXTRICATED' : v.priorityTier,
          };
        }
        return v;
      })
    );

    // Broadcast update
    const v = victims.find(item => item.id === victimId);
    const radioMsg: RadioMessage = {
      id: `msg-${Date.now()}`,
      sender: 'INCIDENT_COMMAND',
      senderLabel: 'Incident Command',
      text: `STATUS UPDATE: ${v?.codeName || `Victim #${victimId}`} updated to "${newStatus}" ${assignedTeam ? `(Assigned: ${assignedTeam})` : ''}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      priority: 'CRITICAL',
    };
    setMessages(m => [radioMsg, ...m]);
  };

  // Simulate new disaster rubble collapse event (creates a new survivor under debris)
  const handleSimulateNewVictim = () => {
    tacticalAudio.playPriorityAlert();
    const newId = victims.length + 1;
    const randomDepth = +(6.5 + Math.random() * 13.0).toFixed(1); // 6.5 to 19.5 feet!
    const newVictim: Victim = {
      id: newId,
      codeName: `SURVIVOR-FOXTROT (ID#0${newId})`,
      x: Math.round(20 + Math.random() * 60),
      y: Math.round(20 + Math.random() * 60),
      sector: 'Sector Charlie - Secondary Collapse Void',
      trappedMinutes: 15,
      depthFeet: randomDepth,
      acousticDb: Math.round(45 + Math.random() * 25),
      acousticHz: 780,
      acousticPattern: 'Rhythmic Tapping',
      acousticConfidence: 94,
      temperature: 34.2,
      ambientTemp: 13.0,
      thermalGradientDelta: 21.2,
      thermalConfidence: 92,
      vibrationHz: 1.6,
      vibrationAmplitude: 0.72,
      vibrationPattern: 'Periodic Kinetic Knock',
      seismicConfidence: 96,
      priorityScore: 94,
      priorityTier: 'P1_CRITICAL',
      estimatedSurvivingHours: 3.2,
      extricationStatus: 'Trapped',
      assignedTeam: null,
      debrisType: 'Reinforced Concrete Slab',
      safeBreachVector: 'Core bore along North-East flank to relieve void compression',
    };

    setVictims(prev => [newVictim, ...prev]);
    setSelectedVictimId(newId);
    setIsDrawerOpen(true);

    const alertMsg: RadioMessage = {
      id: `msg-${Date.now()}`,
      sender: 'DRONE_1',
      senderLabel: 'Drone-01 (ECHO-RAY)',
      text: `NEW SURVIVOR DETECTED: Acoustic tapping detected at ${randomDepth}ft depth under concrete slab! Priority 1 alert.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      priority: 'CRITICAL',
    };
    setMessages(m => [alertMsg, ...m]);
  };

  const handleResetSimulation = () => {
    setVictims(INITIAL_VICTIMS);
    setDrones(INITIAL_DRONES);
    setSelectedVictimId(1);
    setMissionTime(540);
  };

  const handleSendMessage = (text: string, priority: 'ROUTINE' | 'TACTICAL' | 'CRITICAL', sender: string) => {
    const senderLabels: Record<string, string> = {
      INCIDENT_COMMAND: 'Incident Command Base',
      USAR_TEAM_ALPHA: 'USAR Ground Team Alpha',
      USAR_TEAM_BETA: 'USAR Ground Team Beta',
    };

    const newMsg: RadioMessage = {
      id: `msg-${Date.now()}`,
      sender: sender as any,
      senderLabel: senderLabels[sender] || sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      priority,
    };

    setMessages(prev => [newMsg, ...prev]);
    tacticalAudio.playAcousticTapping();
  };

  const handleDispatchAction = (actionData: any) => {
    if (actionData.targetVictimId) {
      setSelectedVictimId(actionData.targetVictimId);
      setIsDrawerOpen(true);
    }
    if (actionData.action === 'dispatch_team') {
      const p1 = victims.find(v => v.priorityTier === 'P1_CRITICAL');
      if (p1) {
        handleUpdateStatus(p1.id, 'Breaching Void', 'USAR Team Alpha');
      }
    }
  };

  const handleRerouteDrone = (droneId: string, pattern: 'SECTOR_SWEEP' | 'TARGET_LOCK' | 'PERIMETER' | 'RETURN_BASE') => {
    tacticalAudio.playAcousticTapping();
    setDrones(prev =>
      prev.map(d => {
        if (d.id === droneId) {
          return {
            ...d,
            status: pattern === 'TARGET_LOCK' ? 'LOCKED_TARGET' : 'SWEEPING',
          };
        }
        return d;
      })
    );
  };

  const handleToggleEquipmentDeploy = (eqId: string) => {
    setEquipmentList(prev =>
      prev.map(eq => {
        if (eq.id === eqId) {
          const nextStatus = eq.status === 'DEPLOYED' ? 'AVAILABLE' : 'DEPLOYED';
          return { ...eq, status: nextStatus };
        }
        return eq;
      })
    );
  };

  const handleToggleConnectivity = (connId: string) => {
    setConnectivityList(prev =>
      prev.map(c => {
        if (c.id === connId) {
          return { ...c, active: !c.active };
        }
        return c;
      })
    );
  };

  const criticalVictimsCount = victims.filter(v => v.priorityTier === 'P1_CRITICAL').length;
  const currentSelectedVictim = victims.find(v => v.id === selectedVictimId) || victims[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Header HUD */}
      <Header
        missionTime={missionTime}
        activeDronesCount={drones.length}
        criticalVictimsCount={criticalVictimsCount}
        totalVictimsCount={victims.length}
        meshLatency={meshLatency}
        isOfflineMode={isOfflineMode}
        queuedSyncCount={queuedSyncItems.length}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onToggleOffline={handleToggleOffline}
        onOpenPlugins={() => setIsPluginsModalOpen(true)}
        onOpenGitHub={() => setIsGitHubModalOpen(true)}
        onTriggerProximityTest={handleTriggerProximityTest}
        onSimulateNewVictim={handleSimulateNewVictim}
        onResetSimulation={handleResetSimulation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: MISSION CONTROL (Interactive Live Map + AI Command Agent + Companion Dashboard) */}
        {activeTab === 'mission_control' && (
          <div className="space-y-6">
            {/* Top Grid: Interactive Live Map + Multilingual AI Tactical Agent */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Map (8 cols on large screens) */}
              <div className="lg:col-span-8">
                <LiveTacticalMap
                  drones={drones}
                  victims={victims}
                  selectedVictimId={selectedVictimId}
                  onSelectVictim={handleSelectVictim}
                  onFocusDroneOnVictim={handleFocusDroneOnVictim}
                  onTriggerMapPing={handleTriggerMapPing}
                />
              </div>

              {/* Multilingual AI Agent (4 cols on large screens) */}
              <div className="lg:col-span-4">
                <AiTacticalAgent
                  drones={drones}
                  victims={victims}
                  onDispatchAction={handleDispatchAction}
                />
              </div>
            </div>

            {/* Companion Command Dashboard for Field Coordinators */}
            <div className="pt-2">
              <CommandDashboard
                drones={drones}
                victims={victims}
                selectedVictimId={selectedVictimId}
                onSelectVictim={handleSelectVictim}
                onRerouteDrone={handleRerouteDrone}
                onBroadcastCoordinatorAlert={(text) => handleSendMessage(text, 'CRITICAL', 'INCIDENT_COMMAND')}
              />
            </div>
          </div>
        )}

        {/* TAB 2: FLOW CHART MONITORING */}
        {activeTab === 'flowchart' && (
          <FlowchartMonitor
            nodes={flowNodes}
            onSelectDrone={(droneId) => {
              setActiveTab('mission_control');
            }}
            detectedCount={victims.length}
            priorityTriageSavedMinutes={142}
          />
        )}

        {/* TAB 3: SEPARATE SENSORS PREDICTION (ACOUSTIC • THERMAL • 20FT SEISMIC) */}
        {activeTab === 'sensors' && (
          <SensorsPanel
            victims={victims}
            drones={drones}
            selectedVictimId={selectedVictimId}
            onSelectVictim={setSelectedVictimId}
          />
        )}

        {/* TAB 4: FIELD COORDINATION & MESH COMMS */}
        {activeTab === 'communications' && (
          <FieldCoordination
            messages={messages}
            onSendMessage={handleSendMessage}
            meshLatency={meshLatency}
          />
        )}
      </main>

      {/* Sliding Victim Triage Drawer for Exact Location Detection & Deep Triage */}
      {isDrawerOpen && (
        <VictimTriageDrawer
          victim={currentSelectedVictim}
          onClose={() => setIsDrawerOpen(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Modular Plugins & Offline Synchronization Modal */}
      <ModularPluginsModal
        isOpen={isPluginsModalOpen}
        onClose={() => setIsPluginsModalOpen(false)}
        equipmentList={equipmentList}
        connectivityList={connectivityList}
        isOfflineMode={isOfflineMode}
        onToggleOffline={handleToggleOffline}
        queuedSyncItems={queuedSyncItems}
        onTriggerSync={handleTriggerSync}
        onToggleEquipmentDeploy={handleToggleEquipmentDeploy}
        onToggleConnectivity={handleToggleConnectivity}
      />

      {/* Real-time Target Proximity Toast Notification (< 5 Meters) */}
      <TargetProximityToast
        alerts={proximityAlerts}
        onDismiss={(alertId) => setProximityAlerts(prev => prev.filter(a => a.id !== alertId))}
        onLockHover={handleFocusDroneOnVictim}
        onInspectVictim={handleSelectVictim}
      />

      {/* GitHub Repository Integration Modal */}
      <GitHubExportModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Tactical Status Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 px-6 text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Swarm Consensus: Synced
          </span>
          <span>•</span>
          <span>Drone 1: Acoustic Debris Array</span>
          <span>•</span>
          <span>Drone 2: FLIR Radiometric</span>
          <span>•</span>
          <span>Drone 3: 20ft Subsurface Seismic</span>
        </div>

        <div className="text-slate-500">
          Rescue Swarm USAR Mission Control • INSARAG Compliant
        </div>
      </footer>
    </div>
  );
}
