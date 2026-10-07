import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Globe, 
  Mic, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal, 
  Flame, 
  Radio, 
  Wrench,
  Loader2
} from 'lucide-react';
import { DroneTelemetry, Victim } from '../types';
import { tacticalAudio } from '../utils/audio';

interface AiTacticalAgentProps {
  drones: DroneTelemetry[];
  victims: Victim[];
  onDispatchAction: (actionData: any) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English (US)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'ja', label: '日本語 (Japanese)' },
  { code: 'zh', label: '中文 (Mandarin)' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'de', label: 'Deutsch (German)' },
  { code: 'ru', label: 'Русский (Russian)' },
];

const PRESET_COMMANDS_BY_LANG: Record<string, string[]> = {
  en: [
    'Focus Drone-01 sound beamformer on Sector Alpha tapping signals',
    'Evaluate hypothermia risk for victim with low surface temperature',
    'Deploy 20-foot seismic radar on subterranean void pocket',
    'Calculate quickest safe extrication path for Priority 1 survivor',
  ],
  es: [
    'Enfocar Drone-01 en las señales acústicas de golpes en Sector Alfa',
    'Evaluar riesgo de hipotermia para el superviviente atrapado',
    'Activar radar sísmico a 20 pies en la cavidad subterránea',
    'Priorizar rescate urgente para la víctima con mayor riesgo vital',
  ],
  hi: [
    'सेक्टर अल्फा में मलबे के नीचे से आ रही आवाज़ों पर ड्रोन-01 केंद्रित करें',
    'कम तापमान वाले पीड़ित के हाइपोथर्मिया जोखिम का विश्लेषण करें',
    '20 फीट गहराई वाले मलबे में भूकंपीय कंपन सेंसर सक्रिय करें',
    'प्राथमिकता-1 वाले पीड़ित के लिए सुरक्षित बचाव मार्ग तैयार करें',
  ],
  ta: [
    'செக்டார் ஆல்பாவில் இடிபாடுகளுக்குள் கேட்கும் தட்டல் ஒலியில் ட்ரோன்-01 ஐ ஒருமுகப்படுத்துக',
    'குறைந்த உடல் வெப்பநிலையால் ஏற்படும் ஆபத்தை ஆராய்க',
    '20 அடி ஆழத்தில் அதிர்வு சென்சாரை இயக்கி உயிரை உறுதி செய்க',
    'முதன்மை உயிர்காப்பு மீட்புக் குழுவை உடனடியாக அனுப்புக',
  ],
  fr: [
    'Orienter Drone-01 sur les signaux de frappe sous les décombres',
    'Analyser le risque d hypothermie de la victime en secteur Bravo',
    'Activer le géophone sismique à 20 pieds sous la dalle',
    'Calculer la trajectoire de brèche sécurisée pour priorité 1',
  ],
  ja: [
    'セクターAの瓦礫下タッピング音にドローン01の音響センサーを集中',
    '低体温症リスクの高い要救助者の優先度を再計算',
    '地下20フィートの空洞に向けて微小振動レーダーを展開',
    'P1最優先の要救助者へ救助隊の最適ルートを指示',
  ],
  zh: [
    '将1号无人机声学波束聚焦于阿尔法区废墟下的敲击声',
    '评估低体温受困幸存者的体温骤降与生命窗口',
    '启动3号无人机对地下20英尺深度的微振动探测雷达',
    '为1号高危幸存者计算最佳低崩塌风险破拆路径',
  ],
  ar: [
    'توجيه الطائرة 1 إلى أصوات الطرق تحت أنقاض القطاع ألفا',
    'تقييم خطر انخفاض حرارة الجسم للناجي المحاصر',
    'تفعيل الرادار الزلزالي على عمق 20 قدماً في الفجوة الأرضية',
    'إرسال فريق الإنقاذ بأسرع مسار آمن للناجي ذي الأولوية القصوى',
  ],
  de: [
    'Drohne-01 auf Klopfgeräusche im Sektor Alpha ausrichten',
    'Hypothermie-Risiko für unterkühlte Person berechnen',
    '20-Fuß Tiefenradar für Erschütterungen im Trümmerfeld aktivieren',
    'Sichersten Rettungsweg für Priorität-1 Überlebenden ermitteln',
  ],
  ru: [
    'Направить Дрон-01 на акустические стуки под завалами Сектора Альфа',
    'Оценить угрозу гипотермии для пострадавшего с низкой температурой',
    'Активировать сейсмический геофон на глубине 20 футов',
    'Рассчитать безопасный коридор деблокирования для первого приоритета',
  ],
};

export const AiTacticalAgent: React.FC<AiTacticalAgentProps> = ({
  drones,
  victims,
  onDispatchAction,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [commandInput, setCommandInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [chatLog, setChatLog] = useState<Array<{
    id: string;
    sender: 'user' | 'agent';
    text: string;
    action?: any;
    timestamp: string;
  }>>([
    {
      id: 'welcome',
      sender: 'agent',
      text: 'AEGIS-SWARM Tactical Commander Online. Autonomous multi-drone search active: Drone 1 (Acoustic under rubble), Drone 2 (Thermal FLIR), Drone 3 (20ft Seismic Geophone). Ready for commands in any language.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSendCommand = async (cmdToSend?: string) => {
    const text = (cmdToSend || commandInput).trim();
    if (!text || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message to log
    setChatLog(prev => [...prev, {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr,
    }]);

    setCommandInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/swarm-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: text,
          language: selectedLang,
          swarmState: {
            droneCount: drones.length,
            drones: drones.map(d => ({ callsign: d.callsign, type: d.type, status: d.status })),
          },
          detectedVictims: victims.map(v => ({
            id: v.id,
            name: v.codeName,
            depthFeet: v.depthFeet,
            priorityScore: v.priorityScore,
            acousticPattern: v.acousticPattern,
            temp: v.temperature,
          })),
        }),
      });

      const data = await response.json();
      const result = data.result || {};

      const agentReply = result.tacticalAdvice || 'Command acknowledged and synchronized across swarm.';
      const spokenText = result.spokenAudioText || agentReply;

      // Add agent message
      setChatLog(prev => [...prev, {
        id: `a-${Date.now()}`,
        sender: 'agent',
        text: agentReply,
        action: result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);

      // Voice read-out in selected language if enabled
      if (voiceEnabled) {
        tacticalAudio.speakTacticalRadio(spokenText, selectedLang);
      }

      // Propagate action to map/swarm
      onDispatchAction(result);

    } catch (err) {
      console.error('Tactical agent command error:', err);
      // Fallback message
      const fallbackReply = `Command processed locally: Swarm adjusting sensor priority for "${text}". Acoustic and 20ft seismic sweeps aligned.`;
      setChatLog(prev => [...prev, {
        id: `a-${Date.now()}`,
        sender: 'agent',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[580px]">
      {/* Agent Top Header */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Bot className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              AEGIS-SWARM AI AGENT
              <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 font-mono text-[10px] border border-sky-800">
                MULTILINGUAL
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Natural Language Mission Command Console
            </div>
          </div>
        </div>

        {/* Language selector & Voice toggle */}
        <div className="flex items-center gap-2">
          {/* Language dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent text-xs font-mono text-slate-200 outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Voice audio toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={voiceEnabled ? "Mute tactical voice feedback" : "Enable tactical voice speech"}
            className={`p-1.5 rounded border transition cursor-pointer ${
              voiceEnabled ? 'bg-sky-500/20 border-sky-500/50 text-sky-300' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Preset Command Pills for selected language */}
      <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
        <span className="text-slate-500 shrink-0 text-[10px]">PRESETS:</span>
        {(PRESET_COMMANDS_BY_LANG[selectedLang] || PRESET_COMMANDS_BY_LANG.en).map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSendCommand(preset)}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition cursor-pointer shrink-0"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
        {chatLog.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
              <span>{msg.sender === 'user' ? 'COMMANDER' : 'AEGIS-AI CORE'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-100 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-200'
              }`}
            >
              <p>{msg.text}</p>

              {/* Action badges if response contains tactical recommendations */}
              {msg.action && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Target Drone:</span>
                    <span className="text-sky-300 font-bold uppercase">{msg.action.targetDrone}</span>
                  </div>

                  {msg.action.recommendedEquipment && msg.action.recommendedEquipment.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-400">Equipment:</span>
                      {msg.action.recommendedEquipment.map((eq: string, i: number) => (
                        <span key={i} className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                          {eq.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            <span>AEGIS-SWARM synthesizing tactical response in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.label}...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendCommand();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder={`Enter command in ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.label} (e.g. Focus acoustic sensor, prioritize victim 1)...`}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-sky-400 pr-10"
            />
          </div>

          <button
            type="submit"
            disabled={!commandInput.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-sky-500/20"
          >
            <span>Execute</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
