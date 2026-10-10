import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Bot, 
  FileText, 
  Camera, 
  Calendar, 
  Layers, 
  Info,
  Shield,
  HelpCircle,
  Clock,
  Check
} from "lucide-react";

interface VoiceDemoModuleProps {
  customApiKey?: string;
}

export default function VoiceDemoModule({ customApiKey }: VoiceDemoModuleProps) {
  // Speech-to-Text States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [extractedName, setExtractedName] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gemini & Chat States
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Text-to-Speech States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(1);
  const [voiceRate, setVoiceRate] = useState(1.0); // Speed

  // Refs for media recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Native SpeechRecognition Fallback Ref
  const recognitionRef = useRef<any>(null);

  // Cleanup synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 15) { // Cap recording at 15s for efficiency
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  // Canvas audio animation (real-time mic waveform if allowed)
  const startCanvasAnimation = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        const width = canvas.width;
        const height = canvas.height;
        
        animationFrameRef.current = requestAnimationFrame(draw);
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw elegant glowing frequency bars
        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.95;
          
          // Indigo/Violet gradient representation
          const percent = barHeight / height;
          ctx.fillStyle = `rgba(99, 102, 241, ${0.4 + percent * 0.6})`;
          
          // Draw rounded bar
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, 4);
          ctx.fill();
          
          x += barWidth;
        }
      };
      
      draw();
    } catch (e) {
      console.warn("Could not start real audio context visualizer, using CSS simulation fallback", e);
    }
  };

  const stopCanvasAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  // Helper: Try to extract name from transcript
  const handleNameDetection = (text: string) => {
    const lower = text.toLowerCase();
    
    // Explicit regex patterns for Spanish greetings
    const patterns = [
      /hola[\s,]+soy\s+([A-Za-zñÑáéíóúÁÉÍÓÚüÜ\s]{2,15})/i,
      /me\s+llamo\s+([A-Za-zñÑáéíóúÁÉÍÓÚüÜ\s]{2,15})/i,
      /mi\s+nombre\s+es\s+([A-Za-zñÑáéíóúÁÉÍÓÚüÜ\s]{2,15})/i,
      /soy\s+([A-Za-zñÑáéíóúÁÉÍÓÚüÜ\s]{2,15})/i,
      /hola\s+([A-Za-zñÑáéíóúÁÉÍÓÚüÜ\s]{2,15})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const cleaned = match[1].trim().split(/[,\.\s]+/)[0];
        if (cleaned.length > 2) {
          // Capitalize first letter
          const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
          setExtractedName(capitalized);
          return capitalized;
        }
      }
    }
    return "";
  };

  // Recording control functions
  const startRecording = async () => {
    setErrorMessage(null);
    setTranscription("");
    setExtractedName("");
    setAiResponse("");
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      let options = {};
      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          options = { mimeType: "audio/webm;codecs=opus" };
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          options = { mimeType: "audio/webm" };
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          options = { mimeType: "audio/mp4" };
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          options = { mimeType: "audio/ogg" };
          mimeType = "audio/ogg";
        } else if (MediaRecorder.isTypeSupported("audio/aac")) {
          options = { mimeType: "audio/aac" };
          mimeType = "audio/aac";
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const actualMimeType = mediaRecorder.mimeType || mimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert to Base64 to transcribe via our Gemini backend API
        setTranscribing(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Data = reader.result as string;
            
            // Send to our /api/transcribe endpoint
            const res = await fetch("/api/transcribe", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                audio: base64Data,
                mimeType: actualMimeType
              })
            });

            const data = await res.json();
            if (data.success && data.text) {
              setTranscription(data.text);
              const nameDetected = handleNameDetection(data.text);
              
              // Trigger AI Response with extracted name or default fallback
              fetchMartinVoiceResponse(data.text, nameDetected || "Leo");
            } else {
              setTranscription("");
              setErrorMessage("No se pudo detectar voz clara. Por favor, intentá de nuevo hablando más cerca.");
              setTranscribing(false);
            }
          };
        } catch (err) {
          console.error("Transcription error:", err);
          setErrorMessage("Error de conexión durante el procesamiento del audio.");
          setTranscribing(false);
        }

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        stopCanvasAnimation();
      };

      mediaRecorder.start(200); // chunk every 200ms
      setIsRecording(true);
      startCanvasAnimation(stream);

    } catch (err: any) {
      console.error("Mic access denied or error:", err);
      setErrorMessage("No se pudo acceder al micrófono. Verificá los permisos de tu navegador o iframe.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Trigger Gemini processing for Martín Voice response
  const fetchMartinVoiceResponse = async (text: string, name: string) => {
    setAiLoading(true);
    setTranscribing(false);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (customApiKey && customApiKey.trim()) {
        headers["x-gemini-api-key"] = customApiKey.trim();
      }

      const res = await fetch("/api/gemini/demo-voice", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: text,
          name: name || "Leo"
        })
      });

      const data = await res.json();
      if (data.success && data.text) {
        setAiResponse(data.text);
        
        // Dynamic Text-to-Speech execution
        speakText(data.text);
      } else {
        setErrorMessage("La IA de Martín no pudo generar su reporte en este momento.");
      }
    } catch (err) {
      console.error("Voice demo AI error:", err);
      setErrorMessage("Ocurrió un error al procesar la respuesta del cerebro de Martín.");
    } finally {
      setAiLoading(false);
    }
  };

  // Text-To-Speech execution (native Web Speech API)
  const speakText = (text: string) => {
    window.speechSynthesis.cancel(); // Reset any ongoing speech
    
    // Clean text from symbols or strange markdown for smooth synthesizer read
    const cleanSpeechText = text
      .replace(/[\*\[\]\(\)\-\#\_]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    
    // Attempt to locate a high-quality Argentine Spanish (es-AR) or general Spanish (es) voice
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.includes("es-AR")) || 
                    voices.find(v => v.lang.includes("es-CL")) ||
                    voices.find(v => v.lang.includes("es-ES")) ||
                    voices.find(v => v.lang.includes("es"));

    if (esVoice) {
      utterance.voice = esVoice;
    }
    
    utterance.volume = voiceVolume;
    utterance.rate = voiceRate;
    utterance.lang = "es-AR";

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (e.error === "canceled" || e.error === "interrupted") {
        return;
      }
      console.warn("Speech Synthesis notice:", e.error || e);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Synthesis controls
  const pauseSpeech = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeech = () => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Re-read existing response
  const handleReplay = () => {
    if (aiResponse) {
      speakText(aiResponse);
    }
  };

  return (
    <div className="space-y-6" id="voice-accessibility-demo">
      {/* Module Title Header Card */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-indigo-950 shadow-md relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 animate-pulse">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold px-2.5 py-0.5 rounded-full uppercase font-mono tracking-wider">
                  Módulo Sorpresa L3
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2.5 py-0.5 rounded-full uppercase font-mono tracking-wider">
                  Accesibilidad Total
                </span>
              </div>
              <h2 className="font-display font-bold text-lg text-white mt-1.5">
                Venta Privada & Demostración de Voz
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-normal">
                Función interactiva de STT (Speech-To-Text) y TTS (Text-To-Speech) con Inteligencia Artificial. Activá el micrófono, preséntate como <strong>"Hola, soy Leo"</strong> (o Noemí) y dejá que Martín te hable directamente en un tono comercial fluido.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: The Interactive Mic & Response Console (6 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[480px]">
            
            {/* Mic and status display */}
            <div className="space-y-6">
              <div className="text-center py-4">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider font-mono">
                  {isRecording ? `Grabando Audio (Micrófono Activo: 0:${recordingSeconds.toString().padStart(2, "0")}/0:15)` : "Consola de Voz Asistida"}
                </span>
                
                {/* Visualizer Frame */}
                <div className="my-6 flex justify-center items-center h-24 relative">
                  {isRecording ? (
                    <div className="w-full max-w-xs h-16 flex items-center justify-center">
                      <canvas 
                        ref={canvasRef} 
                        width={300} 
                        height={64} 
                        className="w-full h-full rounded-lg"
                      />
                    </div>
                  ) : transcribing || aiLoading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-mono text-indigo-600 font-semibold">
                        {transcribing ? "Sincronizando Voz con Gemini STT..." : "Martín está pensando su respuesta..."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 items-center justify-center py-2">
                      <span className="w-1.5 h-3 bg-slate-200 rounded-full" />
                      <span className="w-1.5 h-5 bg-slate-200 rounded-full" />
                      <span className="w-1.5 h-8 bg-slate-300 rounded-full" />
                      <span className="w-1.5 h-12 bg-indigo-200 rounded-full" />
                      <span className="w-1.5 h-6 bg-slate-300 rounded-full" />
                      <span className="w-1.5 h-4 bg-slate-200 rounded-full" />
                      <span className="w-1.5 h-2 bg-slate-200 rounded-full" />
                    </div>
                  )}
                </div>

                {/* Primary Mic Trigger Button */}
                <div className="flex justify-center">
                  {isRecording ? (
                    <button
                      onClick={stopRecording}
                      className="p-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg shadow-rose-600/20 transition-all duration-300 transform scale-110 flex items-center justify-center cursor-pointer relative"
                      title="Detener grabación"
                      id="btn-stop-mic"
                    >
                      <span className="absolute inset-0 rounded-full bg-rose-600 animate-ping opacity-25" />
                      <MicOff className="w-7 h-7" />
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      disabled={transcribing || aiLoading}
                      className="p-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:scale-105 flex items-center justify-center cursor-pointer disabled:bg-slate-300 disabled:shadow-none"
                      title="Grabar mensaje de voz"
                      id="btn-start-mic"
                    >
                      <Mic className="w-7 h-7" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-4 leading-relaxed max-w-sm mx-auto">
                  {isRecording 
                    ? "Hablá fuerte y claro. Al finalizar, apretá el botón rojo de parar o esperá los 15s límite."
                    : "Hacé clic en el botón para activar tu micrófono. Decí: 'Hola, soy Leo, explicame el control de Smart Commerce'."}
                </p>

                {errorMessage && (
                  <div className="mt-3 p-2.5 bg-rose-50 border border-rose-150 rounded-xl text-[10px] text-rose-700 max-w-sm mx-auto flex items-start gap-2 text-left">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Transcription Display */}
            <div className="space-y-4 pt-4 border-t border-slate-100 mt-4">
              <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                  Transcripción de Voz (STT):
                </span>
                <p className="text-xs text-slate-700 italic mt-1 font-sans">
                  {transcription ? `"${transcription}"` : "Esperando captura de voz..."}
                </p>
                {extractedName && (
                  <div className="mt-2 flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg w-fit text-[10px] font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Nombre Detectado: {extractedName}</span>
                  </div>
                )}
              </div>

              {/* AI & TTS RESPONSE DISPLAY */}
              {aiResponse && (
                <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-150 space-y-3 relative">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-indigo-600 font-mono uppercase">Audio Reproduciendo</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-bold text-indigo-700 block font-mono">Martín dice:</span>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium whitespace-pre-wrap">
                        {aiResponse}
                      </p>
                    </div>
                  </div>

                  {/* Audio Synthesizer Controls */}
                  <div className="flex flex-wrap items-center justify-between border-t border-indigo-100/50 pt-3 gap-2">
                    <div className="flex items-center gap-1.5">
                      {isSpeaking && !isPaused ? (
                        <button
                          onClick={pauseSpeech}
                          className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-all cursor-pointer"
                          title="Pausar audio"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      ) : isSpeaking && isPaused ? (
                        <button
                          onClick={resumeSpeech}
                          className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all cursor-pointer"
                          title="Reanudar audio"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={handleReplay}
                          className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                          title="Volver a escuchar"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Repetir</span>
                        </button>
                      )}

                      {isSpeaking && (
                        <button
                          onClick={stopSpeech}
                          className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-all cursor-pointer"
                          title="Silenciar voz"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Volumen:</span>
                        <input 
                          type="range" 
                          min="0.2" 
                          max="1" 
                          step="0.1" 
                          value={voiceVolume} 
                          onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                          className="w-12 h-1 accent-indigo-600 bg-slate-200 rounded-lg cursor-pointer"
                          title="Volumen del sintetizador"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span>Velocidad:</span>
                        <select 
                          value={voiceRate} 
                          onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                          className="bg-transparent border-none text-[10px] text-slate-500 font-bold focus:ring-0 cursor-pointer"
                        >
                          <option value="0.8">0.8x</option>
                          <option value="1.0">1.0x</option>
                          <option value="1.2">1.2x</option>
                          <option value="1.4">1.4x</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Business Logic Controls & Visualizer Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl border border-indigo-950 shadow-md min-h-[480px] flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                Matriz de Control de Smart Commerce
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Esta sección de auditoría expone cómo opera la IA de Martín para resolver las desviaciones financieras y operativas de las 10 sucursales en tiempo real.
              </p>

              <div className="space-y-3 pt-2">
                
                {/* Pillar 1: Control de vencimiento por foto */}
                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/15 shrink-0 mt-0.5">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-white block uppercase tracking-wide font-mono">
                      Control de Vencimiento por Foto
                    </span>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Carga de fotos obligatoria de las facturas en origen. Valida lotes automáticamente al momento de la compra para impedir mermas.
                    </p>
                  </div>
                </div>

                {/* Pillar 2: Alerta de pérdidas por omisión */}
                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/15 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-white block uppercase tracking-wide font-mono">
                      Alerta de Pérdidas por Omisión
                    </span>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Si las sucursales omiten tareas preventivas (como quitar bombones del sol en verano), el sistema reporta la pérdida simulada directo al panel del dueño.
                    </p>
                  </div>
                </div>

                {/* Pillar 3: Promesa de los 3 meses */}
                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/15 shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-white block uppercase tracking-wide font-mono">
                      La Promesa de los 3 Meses
                    </span>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Tras 90 días de aprendizaje continuo de los patrones locales, el sistema predice con tal exactitud la demanda que anula por completo las mermas y traslados.
                    </p>
                  </div>
                </div>

                {/* Pillar 4: Mesa Mayorista */}
                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/15 shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-white block uppercase tracking-wide font-mono">
                      Liquidación en Mesa Mayorista
                    </span>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Espacio exclusivo para remates o reventa de lotes excedentes al por mayor, recuperando liquidez y asegurando un retorno rápido de capital de trabajo.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Owner Ubiquity Callout */}
            <div className="mt-4 p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-300 uppercase font-mono tracking-wider">Ubicuidad Automática</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                La gran innovación es la <strong>Ubicuidad del Dueño</strong>: El sistema recopila datos y detecta desviaciones en los 10 locales de manera automatizada. No dependés de que tus empleados tengan el control de la información; vos tenés visibilidad absoluta en tiempo real sin abrir un solo Excel.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
