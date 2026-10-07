import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI if key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('[Gemini] Failed to initialize GoogleGenAI client:', err);
  }
}

// API Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'operational',
    aiEnabled: !!aiClient,
    timestamp: new Date().toISOString(),
    system: 'RESCUE_SWARM_MISSION_CORE_v4.2',
  });
});

// Endpoint: AI Swarm Multilingual Tactical Command Console
app.post('/api/gemini/swarm-command', async (req: Request, res: Response) => {
  const { command, language = 'en', swarmState, detectedVictims } = req.body;

  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'Command prompt required' });
  }

  // If Gemini is available, use gemini-3.8-flash
  if (aiClient) {
    try {
      const systemInstruction = `You are "AEGIS-SWARM", the AI Tactical Commander for an autonomous 3-drone Urban Search and Rescue (USAR) Swarm.
The drone fleet consists of:
1. Drone-01 "ECHO-RAY" (Acoustic Beamforming & Sound Detection under debris - detects tapping, cries, respiratory audio 300-3400Hz).
2. Drone-02 "THERMO-HAWK" (Radiometric FLIR Thermal Imaging - detects survivor surface temp, hypothermia risk, thermal delta vs concrete).
3. Drone-03 "SEISMO-PROBE" (Subsurface Micro-Vibration & Geophone Radar - ground-penetrating micro-tremor sensor penetrating up to 20 feet / 6 meters depth for rhythmic tapping and pulse waves).

The user is speaking to you in language: "${language}" or any natural language (English, Spanish, French, Hindi, Japanese, Arabic, Tamil, Mandarin, German, etc.).
Always respond in the user's language or requested language!
Analyze the incoming commander request, inspect the swarm telemetry context, and output a structured JSON response:
{
  "action": "reposition" | "focus_victim" | "deploy_plugin" | "adjust_sensor" | "dispatch_team" | "general_intel",
  "targetDrone": "all" | "drone_1" | "drone_2" | "drone_3",
  "targetVictimId": number | null,
  "tacticalAdvice": "Detailed strategic response in the commander's language with specific actionable steps",
  "spokenAudioText": "Short tactical radio confirmation string in the commander's language (max 20 words) suitable for speech output",
  "alertLevel": "LOW" | "NORMAL" | "HIGH" | "CRITICAL",
  "recommendedEquipment": ["pneumatic_lift_bag" | "hydraulic_spreader" | "fiberoptic_camera" | "hypothermia_blanket" | "medical_suction"]
}
Keep tacticalAdvice professional, concise, focused on minimizing time-to-extrication and life-safety priority.`;

      const prompt = `Commander Command: "${command}"
Current Swarm State:
${JSON.stringify(swarmState || {}, null, 2)}
Detected Victims Summary:
${JSON.stringify(detectedVictims || [], null, 2)}
Translate commander intent into immediate tactical actions. Output valid JSON only.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, result: parsed, source: 'gemini' });
      } catch (parseErr) {
        return res.json({
          success: true,
          result: {
            action: 'general_intel',
            targetDrone: 'all',
            targetVictimId: null,
            tacticalAdvice: responseText,
            spokenAudioText: 'Command received and synchronized across swarm.',
            alertLevel: 'NORMAL',
            recommendedEquipment: ['hydraulic_spreader'],
          },
          source: 'gemini_raw',
        });
      }
    } catch (err: any) {
      console.warn('[Gemini API Call error - falling back to tactical fallback]', err?.message);
    }
  }

  // Tactical Rule-based Multilingual Fallback Engine
  const cmdLower = command.toLowerCase();
  let action = 'general_intel';
  let targetDrone = 'all';
  let targetVictimId: number | null = null;
  let alertLevel: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' = 'NORMAL';
  let recommendedEquipment: string[] = ['fiberoptic_camera'];

  // Check for victim references
  const victimMatch = cmdLower.match(/(victim|target|person|survivor|id)\s*#?(\d+)/i);
  if (victimMatch) {
    targetVictimId = parseInt(victimMatch[2], 10);
  }

  let advice = '';
  let radioConfirmation = '';

  if (cmdLower.includes('sound') || cmdLower.includes('acoustic') || cmdLower.includes('drone 1') || cmdLower.includes('echo') || cmdLower.includes('tapping') || cmdLower.includes('audio')) {
    targetDrone = 'drone_1';
    action = 'adjust_sensor';
    advice = `Drone-01 (ECHO-RAY) locked onto rubble sector. Filtering environmental debris noise (ambient 48dB). Narrowband 500-1500Hz acoustic bandpass active. Coherence score 94%.`;
    radioConfirmation = `Echo-Ray acoustic filtering recalibrated. Locking audio resonance.`;
    recommendedEquipment = ['fiberoptic_camera', 'acoustic_listening_probe'];
  } else if (cmdLower.includes('thermal') || cmdLower.includes('heat') || cmdLower.includes('temp') || cmdLower.includes('drone 2') || cmdLower.includes('flir')) {
    targetDrone = 'drone_2';
    action = 'adjust_sensor';
    advice = `Drone-02 (THERMO-HAWK) radiometric sensor calibrated. Delta-T threshold set to +2.4°C above rubble concrete floor. Isotherm overlay tracking potential hypothermia survivors.`;
    radioConfirmation = `Thermo-Hawk radiometric sweep engaged. Thermal isotherms online.`;
    recommendedEquipment = ['hypothermia_blanket', 'emergency_warm_saline'];
  } else if (cmdLower.includes('vibration') || cmdLower.includes('seismic') || cmdLower.includes('depth') || cmdLower.includes('feet') || cmdLower.includes('drone 3') || cmdLower.includes('20')) {
    targetDrone = 'drone_3';
    action = 'adjust_sensor';
    advice = `Drone-03 (SEISMO-PROBE) penetrating ground radar set to 20-foot (6.1m) depth limit. Subsurface geophone detecting rhythmic micro-tremors (1.8 Hz tapping pattern).`;
    radioConfirmation = `Seismo-Probe 20-foot ground radar locked. Subsurface micro-tremors tracked.`;
    recommendedEquipment = ['hydraulic_spreader', 'pneumatic_lift_bag'];
  } else if (cmdLower.includes('extricat') || cmdLower.includes('rescue') || cmdLower.includes('dispatch') || cmdLower.includes('priority')) {
    action = 'dispatch_team';
    alertLevel = 'CRITICAL';
    advice = `Priority-1 Triage dispatch triggered. Directing USAR Extrication Team Beta to the highest survivability urgency sector. Estimated structural stability index: 68%.`;
    radioConfirmation = `USAR Team Alpha and Beta dispatched to critical target waypoint.`;
    recommendedEquipment = ['hydraulic_spreader', 'pneumatic_lift_bag', 'heavy_rotary_cutter'];
  } else {
    advice = `Swarm coordination matrix updated for "${command}". Synchronizing acoustic, FLIR thermal, and 20ft seismic radar data across all 3 drones.`;
    radioConfirmation = `Swarm acknowledging instruction. Mission parameters synchronized.`;
  }

  // Multilingual tactical confirmations
  const translations: Record<string, { advice: string; radio: string }> = {
    es: {
      advice: `Enjambre de rescate actualizado: ${advice}. Cobertura acústica, térmica y sísmica de 20 pies activa.`,
      radio: `Orden recibida. Drones sincronizados en sector.`,
    },
    fr: {
      advice: `Essaim de secours synchronisé: ${advice}. Analyse acoustique, thermique et sismique à 6m opérationnelle.`,
      radio: `Ordre confirmé. Drones en balayage tactique.`,
    },
    de: {
      advice: `Rettungsschwarm synchronisiert: ${advice}. Akustische, thermische und 6m seismische Ortung aktiv.`,
      radio: `Befehl bestätigt. Drohnenschwarm führt aus.`,
    },
    hi: {
      advice: `रेस्क्यू स्वाम सामरिक स्थिति अपडेट: ${advice}। मलबे के नीचे 20 फीट तक ध्वनि, थर्मल और कंपन सेंसर सक्रिय हैं।`,
      radio: `आदेश प्राप्त हुआ। ड्रोन स्वाम अभियान पर है।`,
    },
    ta: {
      advice: `மீட்பு ட்ரோன் திரள் உத்தரவு உறுதி செய்யப்பட்டது: ${advice}। 20 அடி ஆழத்தில் ஒலி, வெப்பம் மற்றும் அதிர்வு உணரி செயலில் உள்ளது.`,
      radio: `கட்டளை ஏற்கப்பட்டது. மீட்பு ட்ரோன்கள் செயல்படுகின்றன.`,
    },
    ja: {
      advice: `レスキュースウォーム命令受信: ${advice}。音響・熱・地下20フィート振動センサーを統合中。`,
      radio: `了解。全ドローンが救助捜索を実行中。`,
    },
    zh: {
      advice: `救援蜂群系统更新: ${advice}。20英尺地下声学、红外热成像与微振动雷达全力追踪中。`,
      radio: `指令收到，无人机蜂群正全速执行搜救。`,
    },
    ar: {
      advice: `تم تحديث سرب الإنقاذ: ${advice}. مسح صوتي وحراري واهتزازي تحت الأنقاض لعمق 20 قدماً.`,
      radio: `تم استلام الأمر. سرب الطائرات ينفذ المهمة.`,
    },
  };

  if (language && translations[language]) {
    advice = translations[language].advice;
    radioConfirmation = translations[language].radio;
  }

  return res.json({
    success: true,
    result: {
      action,
      targetDrone,
      targetVictimId,
      tacticalAdvice: advice,
      spokenAudioText: radioConfirmation || 'Command confirmed. Swarm engaged.',
      alertLevel,
      recommendedEquipment,
    },
    source: 'tactical_engine',
  });
});

// Endpoint: AI Survivor Multi-Modal Triage Analysis
app.post('/api/gemini/triage-analysis', async (req: Request, res: Response) => {
  const { victim, language = 'en' } = req.body;

  if (!victim) {
    return res.status(400).json({ error: 'Victim sensor data missing' });
  }

  if (aiClient) {
    try {
      const prompt = `You are the Medical & Engineering Triage AI for an Urban Search & Rescue Swarm.
Analyze this trapped survivor's multi-sensor readings:
- Sound Detection (Drone 1): ${victim.acousticDb} dB, frequency ${victim.acousticHz} Hz, pattern: ${victim.acousticPattern}
- Body Temperature (Drone 2): ${victim.temperature}°C (ambient rubble: ${victim.ambientTemp || 14}°C)
- Subsurface Vibration (Drone 3): ${victim.vibrationHz} Hz, amplitude ${victim.vibrationAmplitude} mm/s, depth: ${victim.depthFeet} feet below debris
- Time Trapped: ${victim.trappedMinutes || 45} minutes
- Debris Composition: ${victim.debrisType || 'Reinforced concrete slabs and structural steel'}

Provide in language "${language}":
1. Priority Score (1 to 100, where 100 is most urgent immediate life threat)
2. Survivability Window (hours remaining without air/hydration/extrication)
3. Structural Collapse Hazard & Safe Breaching Angle
4. Step-by-Step Extrication Equipment Checklist (hydraulic spreaders, airbags, shoring, core drill, medical IV)
Return strictly valid JSON:
{
  "calculatedPriority": 95,
  "priorityLevel": "CRITICAL_P1" | "HIGH_P2" | "MODERATE_P3",
  "survivabilityWindowHours": 3.5,
  "injuryRisk": "Crush syndrome / Acute Hypothermia",
  "collapseRiskIndex": 72,
  "safeBreachingVector": "Lateral approach from Grid North-West to prevent void collapse",
  "equipmentChecklist": ["Pneumatic 20T Air Lifting Bags", "Heavy Hydraulic Ram", "Hypothermia Thermal Foil Wrap", "Fiberoptic Search Cam"],
  "tacticalSummary": "Short USAR triage memo in language ${language}"
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, triage: parsed, source: 'gemini' });
    } catch (err: any) {
      console.warn('[Gemini triage error - using algorithm]', err?.message);
    }
  }

  // Triage scoring algorithm
  const tempDeviation = Math.abs(victim.temperature - 36.8);
  const depthPenalty = (victim.depthFeet || 6) * 2.5;
  const soundBonus = victim.acousticDb > 35 ? 25 : 10;
  const vibrationUrgency = victim.vibrationAmplitude > 0.4 ? 20 : 10;
  let priority = Math.min(99, Math.round(50 + soundBonus + vibrationUrgency - tempDeviation * 4 + depthPenalty));

  let priorityLevel = 'CRITICAL_P1';
  if (priority < 70) priorityLevel = 'MODERATE_P3';
  else if (priority < 85) priorityLevel = 'HIGH_P2';

  const hoursRemaining = Math.max(1.2, +(18 - (depthPenalty / 3) - tempDeviation * 1.5).toFixed(1));

  res.json({
    success: true,
    triage: {
      calculatedPriority: priority,
      priorityLevel,
      survivabilityWindowHours: hoursRemaining,
      injuryRisk: victim.temperature < 34 ? 'Acute Hypothermia & Compression Injury' : 'Crush Asphyxia Risk',
      collapseRiskIndex: Math.min(85, Math.round(40 + depthPenalty)),
      safeBreachingVector: 'Diagonal trench cut along Sector 3 void perimeter',
      equipmentChecklist: [
        'Hydraulic Spreader 500kN',
        'Pneumatic High-Pressure Air Bags',
        'Seismic Micro-Geophone Probe',
        'Advanced Thermal Blanket & Oxygen Mask'
      ],
      tacticalSummary: `Urgent extrication prioritized for target at ${victim.depthFeet}ft depth. Acoustic coherence confirmed vital tapping rhythms. Rapid void stabilization recommended.`,
    },
    source: 'local_triage_engine'
  });
});

// Configure Vite integration for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Rescue Swarm Core] Mission Control server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Rescue Swarm Core] Server startup failed:', err);
  process.exit(1);
});
