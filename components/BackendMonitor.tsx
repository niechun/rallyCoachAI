
import React, { useState } from 'react';
import { ProcessingStatus } from '../types';

interface BackendMonitorProps {
  status: ProcessingStatus;
  logs: string[];
}

const BackendMonitor: React.FC<BackendMonitorProps> = ({ status, logs }) => {
  const [view, setView] = useState<'console' | 'code' | 'infra'>('console');

  const pythonScript = `
# skeletal_tracking.py (Conceptual Backend Implementation)
import cv2
import mediapipe as mp
import json

def process_tennis_video(video_path):
    # Initialize MediaPipe Pose for skeletal tracking
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5)
    
    cap = cv2.VideoCapture(video_path)
    frame_data = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        # Inference Phase: Detect joints
        results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        
        if results.pose_landmarks:
            # Extract key tennis points: Elbows, Knees, Shoulders
            landmarks = results.pose_landmarks.landmark
            frame_data.append({
                "elbow_angle": calculate_angle(landmarks[11], landmarks[13], landmarks[15]),
                "knee_bend": calculate_angle(landmarks[23], landmarks[25], landmarks[27])
            })
            
    # Save annotated video and metadata
    save_annotated_video(cap, frame_data)
    return json.dumps(frame_data)
  `;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl font-mono">
        {/* Terminal Header */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex gap-4">
            <button 
              onClick={() => setView('console')}
              className={`text-[10px] font-bold tracking-widest uppercase pb-1 border-b-2 transition-all ${view === 'console' ? 'text-tennis-yellow border-tennis-yellow' : 'text-slate-500 border-transparent'}`}
            >
              Live Console
            </button>
            <button 
              onClick={() => setView('code')}
              className={`text-[10px] font-bold tracking-widest uppercase pb-1 border-b-2 transition-all ${view === 'code' ? 'text-tennis-yellow border-tennis-yellow' : 'text-slate-500 border-transparent'}`}
            >
              Worker Script (.py)
            </button>
            <button 
              onClick={() => setView('infra')}
              className={`text-[10px] font-bold tracking-widest uppercase pb-1 border-b-2 transition-all ${view === 'infra' ? 'text-tennis-yellow border-tennis-yellow' : 'text-slate-500 border-transparent'}`}
            >
              Infrastructure
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status !== ProcessingStatus.IDLE ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></span>
            <span className="text-slate-400 text-[10px]">{status !== ProcessingStatus.IDLE ? 'CONNECTED' : 'STANDBY'}</span>
          </div>
        </div>

        {/* Console View */}
        {view === 'console' && (
          <div className="p-4 h-64 overflow-y-auto space-y-1 text-xs custom-scrollbar">
            {logs.length === 0 && <div className="text-slate-600 italic">Waiting for input stream...</div>}
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                <span className={log.startsWith('ERR') ? 'text-red-400' : log.startsWith('WRN') ? 'text-yellow-400' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))}
            {status !== ProcessingStatus.IDLE && status !== ProcessingStatus.COMPLETED && (
              <div className="text-tennis-yellow animate-pulse">_</div>
            )}
          </div>
        )}

        {/* Code View */}
        {view === 'code' && (
          <div className="p-4 h-64 overflow-y-auto text-[11px] text-blue-300 bg-slate-950/50 custom-scrollbar">
            <div className="mb-4 text-slate-500 italic"># This code runs on the Backend GPU Worker</div>
            <pre><code>{pythonScript}</code></pre>
          </div>
        )}

        {/* Infra View */}
        {view === 'infra' && (
          <div className="p-8 h-64 flex items-center justify-center">
            <div className="flex items-center gap-4 text-center">
              <div className="p-3 rounded-lg border border-slate-700 bg-slate-900 w-32">
                <i className="fa-solid fa-laptop text-slate-500 mb-2"></i>
                <div className="text-[10px] text-slate-400">Client Browser</div>
              </div>
              <i className="fa-solid fa-arrow-right text-tennis-yellow animate-pulse"></i>
              <div className="p-3 rounded-lg border border-tennis-yellow bg-tennis-green/20 w-32 relative">
                <div className="absolute -top-2 -right-2 bg-tennis-yellow text-slate-900 text-[8px] font-bold px-1 rounded">ACTIVE</div>
                <i className="fa-solid fa-server text-tennis-yellow mb-2"></i>
                <div className="text-[10px] text-tennis-yellow">Python Worker</div>
              </div>
              <i className="fa-solid fa-arrow-right text-slate-700"></i>
              <div className="p-3 rounded-lg border border-slate-700 bg-slate-900 w-32">
                <i className="fa-solid fa-brain text-slate-500 mb-2"></i>
                <div className="text-[10px] text-slate-400">Gemini LLM</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
          <h4 className="text-slate-500 text-[10px] uppercase font-bold mb-2">Storage Layer</h4>
          <p className="text-xs text-slate-300">Google Cloud Storage</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
          <h4 className="text-slate-500 text-[10px] uppercase font-bold mb-2">Compute Layer</h4>
          <p className="text-xs text-slate-300">NVIDIA T4 GPU Workers</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
          <h4 className="text-slate-500 text-[10px] uppercase font-bold mb-2">Cognition Layer</h4>
          <p className="text-xs text-slate-300">Gemini 3 Flash</p>
        </div>
      </div>
    </div>
  );
};

export default BackendMonitor;
