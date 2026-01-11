
import React, { useState, useRef, useEffect } from 'react';
import { ProcessingStatus, AnalysisResult, VideoMetadata } from './types';
import ProcessingPipeline from './components/ProcessingPipeline';
import AnalysisView from './components/AnalysisView';
import BackendMonitor from './components/BackendMonitor';

const API_URL = "http://localhost:8080";

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-15), msg]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMetadata({ name: file.name, size: file.size });
    setResult(null);
    setLogs([]);
    setStatus(ProcessingStatus.UPLOADING);
    setProgress(15);
    addLog(`INIT: Received file ${file.name}`);
    addLog(`SYS: Connecting to RallyCoach Worker...`);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Progress simulation
      const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 1 : prev));
      }, 1200);

      addLog("GCS: Initializing storage bucket stream...");
      addLog("GCS: Transferring bytes to google-cloud-storage...");
      
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(errorData.detail || "Backend Worker failed to process video.");
      }

      addLog("AI: Gemini indexing complete. Generating report...");
      const data = await response.json();
      
      setStatus(ProcessingStatus.ANALYZING);
      setProgress(100);
      setResult(data);
      setStatus(ProcessingStatus.COMPLETED);
      addLog("SYS: Pipeline execution success. Assets archived in GCS.");

    } catch (err: any) {
      console.error(err);
      setStatus(ProcessingStatus.ERROR);
      addLog(`ERR: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-court/10 blur-glow -z-10"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-tennis-yellow/5 blur-glow -z-10"></div>

      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tennis-yellow rounded-xl flex items-center justify-center rotate-3 shadow-lg">
              <i className="fa-solid fa-baseball text-slate-950 text-xl"></i>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">
              RallyCoach <span className="gradient-text">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              BACKEND: {status !== ProcessingStatus.IDLE ? 'ACTIVE' : 'READY'}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {status === ProcessingStatus.IDLE && (
          <div className="text-center py-20 space-y-10 animate-in fade-in duration-1000">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight leading-tight">
                Store, Track, <br />
                <span className="gradient-text">Master Your Game.</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                Securely upload your matches to RallyCloud. Our AI analyzes your biomechanics 
                to provide professional technical fixes instantly.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer relative p-12 bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-800 hover:border-tennis-yellow/50 hover:bg-slate-900/60 transition-all duration-500 w-full max-xl"
              >
                <div className="relative z-10 space-y-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-3xl mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-tennis-yellow transition-all duration-500">
                    <i className="fa-solid fa-video text-3xl text-slate-400 group-hover:text-slate-950"></i>
                  </div>
                  <div>
                    <p className="text-xl font-bold">Upload Match Footage</p>
                    <p className="text-slate-500 mt-1">Archived to GCS & Analyzed by RallyCoach AI</p>
                  </div>
                </div>
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="video/*" 
              onChange={handleUpload} 
            />
          </div>
        )}

        {(status !== ProcessingStatus.IDLE && status !== ProcessingStatus.COMPLETED) && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <ProcessingPipeline status={status} progress={progress} />
            <BackendMonitor status={status} logs={logs} />
          </div>
        )}

        {status === ProcessingStatus.COMPLETED && result && (
          <AnalysisView 
            result={result} 
            onReset={() => setStatus(ProcessingStatus.IDLE)} 
          />
        )}

        {status === ProcessingStatus.ERROR && (
          <div className="max-w-xl mx-auto text-center py-20 space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full mx-auto flex items-center justify-center border border-red-500/20">
              <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500"></i>
            </div>
            <h3 className="text-2xl font-bold">Analysis Failed</h3>
            <p className="text-slate-400">{logs[logs.length - 1]}</p>
            <button 
              onClick={() => setStatus(ProcessingStatus.IDLE)}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-full font-bold transition-all"
            >
              Retry Upload
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
