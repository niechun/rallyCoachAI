
import React from 'react';
import { AnalysisResult } from '../types';

interface AnalysisViewProps {
  result: AnalysisResult;
  onReset: () => void;
  storagePath?: string;
  videoUrl?: string;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onReset, storagePath, videoUrl }) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-display font-bold">Performance Stats</h3>
            <i className="fa-solid fa-chart-line text-tennis-yellow text-2xl"></i>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Technical Execution</span>
                <span className="text-tennis-yellow font-bold">{result.technicalScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full">
                <div className="h-full bg-tennis-yellow rounded-full" style={{ width: `${result.technicalScore}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Tactical Awareness</span>
                <span className="text-court font-bold">{result.tacticalScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full">
                <div className="h-full bg-court rounded-full" style={{ width: `${result.tacticalScore}%` }}></div>
              </div>
            </div>
          </div>
          <p className="mt-8 text-slate-300 italic">"{result.summary}"</p>
        </div>

        <div className="bg-tennis-green/20 p-8 rounded-3xl border border-tennis-green/30">
          <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
            <i className="fa-solid fa-star text-tennis-yellow"></i>
            Key Strengths
          </h3>
          <ul className="space-y-4">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex gap-3 text-slate-200">
                <i className="fa-solid fa-circle-check text-tennis-yellow mt-1"></i>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800">
          <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 text-clay">
            <i className="fa-solid fa-wrench"></i>
            Areas for Improvement
          </h3>
          <ul className="space-y-4">
            {result.improvements.map((imp, i) => (
              <li key={i} className="flex gap-3 text-slate-200">
                <i className="fa-solid fa-triangle-exclamation text-clay mt-1"></i>
                {imp}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800">
          <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 text-court">
            <i className="fa-solid fa-clipboard-list"></i>
            Recommended Drills
          </h3>
          <ul className="space-y-4">
            {result.drills.map((drill, i) => (
              <li key={i} className="flex gap-3 text-slate-200">
                <i className="fa-solid fa-person-running text-court mt-1"></i>
                {drill}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Storage & Assets Section */}
      <div className="bg-slate-900/40 p-8 rounded-3xl border border-dashed border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-display font-bold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-database text-slate-500"></i>
              Match Assets & Storage
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-slate-400">
                Production Storage Path: <code className="text-tennis-yellow bg-slate-950 px-2 py-0.5 rounded ml-1">{storagePath || 'gs://rallycoach-raw/session_default'}</code>
              </p>
              <p className="text-xs text-slate-500 italic">Storage located in Google Cloud Project: rally-coach-ai-342</p>
            </div>
          </div>
          <div className="flex gap-3">
            {videoUrl && (
              <a 
                href={videoUrl} 
                download="rallycoach_analysis.mp4"
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
              >
                <i className="fa-solid fa-download"></i>
                Download Annotated Video
              </a>
            )}
            <button 
              onClick={() => window.open(`https://console.cloud.google.com/storage/browser/${(storagePath || '').replace('gs://', '')}`, '_blank')}
              className="px-6 py-2.5 bg-court/20 hover:bg-court/40 border border-court/30 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            >
              <i className="fa-solid fa-external-link"></i>
              View in GCS Console
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-full font-bold transition-all shadow-xl hover:shadow-tennis-yellow/10"
        >
          Analyze Another Match
        </button>
      </div>
    </div>
  );
};

export default AnalysisView;
