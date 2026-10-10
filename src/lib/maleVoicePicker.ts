/**
 * Martin IA Male Voice Synthesizer & Speech Helper
 * Ensures Martín always speaks with a warm, professional, masculine Spanish voice.
 */

import { cleanTextForSpeech } from "./speechCleaner";

export interface VoiceConfig {
  pitch?: number;
  rate?: number;
  volume?: number;
}

export function getMartinMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Priority: Male Spanish voices
  const maleKeywords = [
    "male",
    "masculino",
    "hombre",
    "raul",
    "jorge",
    "diego",
    "pablo",
    "david",
    "alvaro",
    "álvaro",
    "carlos",
    "miguel",
    "enrique",
    "gonzalo",
    "tomas",
    "tomás",
    "javier",
    "mateo",
    "standard-b",
    "standard-d",
    "wavenet-b",
    "wavenet-d",
    "neural2-b",
    "guy",
    "antonio",
    "julio"
  ];

  // Check Spanish voices first (es-AR, es-419, es-MX, es-ES, es-CL, es-CO, es-US, es)
  const spanishVoices = voices.filter(v => v.lang.toLowerCase().startsWith("es"));

  // Check for explicit male name in Spanish voices
  for (const sv of spanishVoices) {
    const nameLower = sv.name.toLowerCase();
    if (maleKeywords.some(keyword => nameLower.includes(keyword))) {
      return sv;
    }
  }

  // Check for Argentine or Latin American voices
  const argVoice = spanishVoices.find(v => v.lang.toLowerCase().includes("es-ar") || v.lang.toLowerCase().includes("es_ar"));
  if (argVoice) return argVoice;

  const latamVoice = spanishVoices.find(v => v.lang.toLowerCase().includes("es-419") || v.lang.toLowerCase().includes("es-mx"));
  if (latamVoice) return latamVoice;

  // Fallback to any Spanish voice
  if (spanishVoices.length > 0) {
    // Avoid explicitly female-named voices if possible
    const femaleKeywords = ["monica", "mónica", "paulina", "helena", "laura", "lucia", "lucía", "marta", "rosa", "female", "femenino", "mujer", "sabina", "elvira"];
    const nonFemale = spanishVoices.find(v => !femaleKeywords.some(f => v.name.toLowerCase().includes(f)));
    if (nonFemale) return nonFemale;
    return spanishVoices[0];
  }

  return voices[0] || null;
}

/**
 * Speaks text using Martín's masculine, natural Spanish settings
 */
export function speakMartin(
  text: string, 
  onStart?: () => void, 
  onEnd?: () => void, 
  onError?: (err: any) => void,
  customConfig?: VoiceConfig
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  try {
    window.speechSynthesis.cancel();

    // Clean markdown, tags, character limits, formulas, and formatting artifacts
    const cleaned = cleanTextForSpeech(text);

    if (!cleaned) return null;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = "es-AR";
    
    // Male vocal profile: slightly deeper pitch and firm, clear business tempo
    utterance.pitch = customConfig?.pitch ?? 0.92;
    utterance.rate = customConfig?.rate ?? 0.96;
    utterance.volume = customConfig?.volume ?? 1.0;

    const maleVoice = getMartinMaleVoice();
    if (maleVoice) {
      utterance.voice = maleVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) {
      utterance.onerror = (err: any) => {
        if (err?.error === "canceled" || err?.error === "interrupted") {
          return;
        }
        onError(err);
      };
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (e) {
    console.warn("Speech synthesis execution failed:", e);
    if (onError) onError(e);
    return null;
  }
}

export function stopMartinSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
