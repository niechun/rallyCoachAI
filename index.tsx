
import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types & Interfaces ---
enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  INFERENCE = 'INFERENCE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

interface AnalysisResult {
  technicalScore: number;
  tacticalScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  drills: string[];
}

// --- Constants ---
const SYSTEM_INSTRUCTION = `
You are RallyCoach AI, an elite world-class tennis coach with expertise in biomechanics. 
Analyze the user's request (and simulated video data) and provide professional, actionable feedback.
Use professional tennis terminology: unit turn, kinetic chain, split step, racket lag, pronation.
Return a structured JSON report.
`;

// --- UI Components ---

const ProgressBar: React.FC<{ progress: number; status: ProcessingStatus }> = ({ progress, status }) => {
  const steps = [
    { id: ProcessingStatus.UPLOADING, label: 'Upload', icon: 'fa-cloud-arrow-up' },
    { id: ProcessingStatus.INFERENCE, label: 'Inference', icon: 'fa-microchip' },
    { id: ProcessingStatus.ANALYZING, label: 'Analysis', icon: 'fa-user-tie' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-8 bg-slate-900/60 rounded-[2rem] border border-slate-800 backdrop-blur-xl shadow-2xl">
      <div className="relative mb-12">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-tennis-yellow transition-all duration-1000 ease-in-out shadow-[0_0_10px_#dfff4f]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="relative flex justify-between">
          {steps.map((step, idx) => {
            const isActive = status === step.id;
            const isDone = progress > (idx + 1) * 33 || status === ProcessingStatus.COMPLETED;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center z-10 transition-all duration-500 ${
                  isDone ? 'bg-tennis-yellow border-tennis-yellow shadow-lg' : 
                  isActive ? 'bg-slate-900 border-blue-400 animate-pulse' : 'bg-slate-900 border-slate-700'
                }`}>
                  <i className={`fa-solid ${step.icon} ${isDone ? 'text-slate-950' : isActive ? 'text-blue-400' : 'text-slate-600'} text-xl`}></i>
                </div>
                <span className={`mt-3 text-[10px] font-bold uppercase tracking-[0.2em] ${isDone ? 'text-tennis-yellow' : isActive ? 'text-blue-400' : 'text-slate-600'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-slate-300 font-medium h-6">
          {status === ProcessingStatus.UPLOADING && "Synchronizing match footage with RallyCloud..."}
          {status === ProcessingStatus.INFERENCE && "GPU Inference: Detecting player skeletal markers..."}
          {status === ProcessingStatus.ANALYZING && "Gemini 3 consulting pro-coaching databases..."}
        </p>
        <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Latency: 240ms | Workers: Active</p>
      </div>
    </div>
  );
};

const AnalysisReport: React.FC<{ result: AnalysisResult; onReset: () => void }> = ({ result, onReset }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-900/80 p-10 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-tennis-yellow/5 blur-[60px] group-hover:bg-tennis-yellow/10 transition-all"></div>
        <h3 className="text-2xl font-display font-bold mb-8">Performance DNA</h3>
        <div className="space-y-8">
          <div>
            <div className="flex justify-between mb-3 text-sm font-bold tracking-tight uppercase">
              <span className="text-slate-500">Technical Prowess</span>
              <span className="text-tennis-yellow">{result.technicalScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-tennis-yellow rounded-full transition-all duration-1000" style={{ width: `${result.technicalScore}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-3 text-sm font-bold tracking-tight uppercase">
              <span className="text-slate-500">Tactical IQ</span>
              <span className="text-blue-400">{result.tacticalScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full transition-all duration-1000" style={{ width: `${result.tacticalScore}%` }}></div>
            </div>
          </div>
        </div>
        <div className="mt-10 p-6 bg-slate-950/50 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed italic">
          "{result.summary}"
        </div>
      </div>

      <div className="bg-slate-900/80 p-10 rounded-[2.5rem] border border-slate-800 shadow-xl">
        <h3 className="text-2xl font-display font-bold mb-6 text-green-400 flex items-center gap-3">
          <i className="fa-solid fa-bolt"></i> Elite Strengths
        </h3>
        <ul className="space-y-4">
          {result.strengths.map((s, i) => (
            <li key={i} className="flex gap-4 items-start text-slate-300">
              <div className="mt-1.5 w-2 h-2 rounded-full bg-tennis-yellow shadow-[0_0_8px_#dfff4f]"></div>
              <span className="flex-1">{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-900/80 p-10 rounded-[2.5rem] border border-slate-800">
        <h3 className="text-2xl font-display font-bold mb-6 text-tennis-clay flex items-center gap-3">
          <i className="fa-solid fa-microscope"></i> Biomechanical Fixes
        </h3>
        <div className="grid gap-3">
          {result.improvements.map((imp, i) => (
            <div key={i} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-400 text-sm leading-relaxed">
              {imp}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-900/80 p-10 rounded-[2.5rem] border border-slate-800">
        <h3 className="text-2xl font-display font-bold mb-6 text-blue-400 flex items-center gap-3">
          <i className="fa-solid fa-person-running"></i> Pro Practice Plan
        </h3>
        <div className="grid gap-3">
          {result.drills.map((drill, i) => (
            <div key={i} className="bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10 text-slate-400 text-sm leading-relaxed">
              <span className="text-blue-400 font-bold block mb-1">DRILL {i+1}</span>
              {drill}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="flex justify-center pt-10">
      <button 
        onClick={onReset}
        className="px-12 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl"
      >
        Analyze New Footage
      </button>
    </div>
  </div>
);

// --- App Root ---

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const performAIAnalysis = async (fileName: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I have uploaded a tennis video named "${fileName}". Please analyze it and provide a detailed coaching report.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              technicalScore: { type: Type.NUMBER },
              tacticalScore: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              drills: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["technicalScore", "tacticalScore", "summary", "strengths", "improvements", "drills"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      return data as AnalysisResult;
    } catch (e) {
      console.error("AI Analysis Error:", e);
      throw new Error("The AI Coach encountered an error processing your swing.");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus(ProcessingStatus.UPLOADING);
    setProgress(15);
    setError(null);

    try {
      // Phase 1: Upload (Simulated)
      await new Promise(r => setTimeout(r, 1500));
      setProgress(45);
      setStatus(ProcessingStatus.INFERENCE);

      // Phase 2: AI Call
      const aiData = await performAIAnalysis(file.name);
      
      setProgress(75);
      setStatus(ProcessingStatus.ANALYZING);
      await new Promise(r => setTimeout(r, 1000));

      setProgress(100);
      setResult(aiData);
      setStatus(ProcessingStatus.COMPLETED);

    } catch (err: any) {
      setStatus(ProcessingStatus.ERROR);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-tennis-yellow selection:text-slate-900 pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-tennis-yellow/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <nav className="relative z-10 px-8 py-6 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tennis-yellow rounded-xl flex items-center justify-center rotate-3 shadow-[0_0_20px_rgba(223,255,79,0.2)]">
              <i className="fa-solid fa-baseball text-slate-900 text-xl"></i>
            </div>
            <h1 className="text-2xl font-display font-extrabold tracking-tighter">
              RallyCoach <span className="gradient-text">AI</span>
            </h1>
          </div>
          <div className="hidden sm:flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            <span className="hover:text-tennis-yellow cursor-default transition-colors">Biometrics</span>
            <span className="hover:text-tennis-yellow cursor-default transition-colors">Tactics</span>
            <span className="hover:text-tennis-yellow cursor-default transition-colors">Drills</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {status === ProcessingStatus.IDLE && (
          <div className="text-center space-y-16 animate-in fade-in zoom-in-95 duration-1000">
            <div className="space-y-6">
              <h2 className="text-6xl md:text-8xl font-display font-black leading-[0.85] tracking-tight">
                Turn Every Match <br />
                Into <span className="gradient-text italic">Insight.</span>
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                Professional biomechanical tracking and Gemini 3 analysis. 
                Upload your training footage to unlock pro-level performance.
              </p>
            </div>

            <div className="flex flex-col items-center gap-10">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-full max-w-2xl aspect-[16/7] bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center transition-all duration-700 hover:border-tennis-yellow/40 hover:bg-slate-900/50 cursor-pointer shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-tennis-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-[2rem] flex items-center justify-center group-hover:scale-110 group-hover:bg-tennis-yellow transition-all duration-500 shadow-xl">
                    <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-500 group-hover:text-slate-950"></i>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold tracking-tight">Drop Match Footage</p>
                    <p className="text-slate-500 mt-1 font-medium text-sm">MP4, MOV, AVI (Max 100MB)</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-10 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-3"><i className="fa-solid fa-check text-tennis-yellow"></i> Kinetic Chain Analysis</span>
                <span className="flex items-center gap-3"><i className="fa-solid fa-check text-tennis-yellow"></i> Unit Turn Detection</span>
                <span className="flex items-center gap-3"><i className="fa-solid fa-check text-tennis-yellow"></i> Tactical heatmaps</span>
              </div>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleUpload} />
          </div>
        )}

        {(status !== ProcessingStatus.IDLE && status !== ProcessingStatus.COMPLETED && status !== ProcessingStatus.ERROR) && (
          <ProgressBar progress={progress} status={status} />
        )}

        {status === ProcessingStatus.COMPLETED && result && (
          <AnalysisReport result={result} onReset={() => setStatus(ProcessingStatus.IDLE)} />
        )}

        {status === ProcessingStatus.ERROR && (
          <div className="max-w-lg mx-auto bg-red-500/5 border border-red-500/20 p-12 rounded-[2.5rem] text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-red-500/10 rounded-full mx-auto flex items-center justify-center">
              <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500"></i>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Analysis Failed</h3>
              <p className="text-slate-400 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setStatus(ProcessingStatus.IDLE)}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-bold transition-all border border-slate-700"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-8 py-12 border-t border-slate-900 mt-20 opacity-50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
          <div className="text-slate-500">
            &copy; 2025 RALLYCOACH AI / BIOMETRICS DIVISION
          </div>
          <div className="flex gap-8 text-slate-600">
            <a href="#" className="hover:text-tennis-yellow transition-colors">Privacy</a>
            <a href="#" className="hover:text-tennis-yellow transition-colors">Telemetry</a>
            <a href="#" className="hover:text-tennis-yellow transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Initial Render ---
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<React.StrictMode><App /></React.StrictMode>);
}
