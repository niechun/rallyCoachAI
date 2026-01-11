
import React from 'react';
import { ProcessingStatus } from '../types';

interface ProcessingPipelineProps {
  status: ProcessingStatus;
  progress: number;
}

const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ status, progress }) => {
  const steps = [
    { id: ProcessingStatus.UPLOADING, label: 'Secure Upload', icon: 'fa-cloud-arrow-up' },
    { id: ProcessingStatus.INFERENCE, label: 'AI Inference (CV)', icon: 'fa-microchip' },
    { id: ProcessingStatus.ANALYZING, label: 'Pro-Coach Analysis', icon: 'fa-user-tie' },
  ];

  const getStatusColor = (stepId: ProcessingStatus) => {
    const statusOrder = [ProcessingStatus.UPLOADING, ProcessingStatus.INFERENCE, ProcessingStatus.ANALYZING, ProcessingStatus.COMPLETED];
    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(stepId);

    if (status === ProcessingStatus.ERROR) return 'text-red-500';
    if (stepIndex < currentIndex || status === ProcessingStatus.COMPLETED) return 'text-tennis-yellow';
    if (stepIndex === currentIndex) return 'text-blue-400 animate-pulse';
    return 'text-slate-600';
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 bg-slate-900/50 rounded-3xl border border-slate-800 backdrop-blur-sm">
      <h3 className="text-xl font-display font-bold mb-8 text-center">Processing Pipeline</h3>
      
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-tennis-yellow transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="relative flex justify-between">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full bg-slate-900 border-2 flex items-center justify-center z-10 transition-colors duration-300 ${
                getStatusColor(step.id).includes('tennis-yellow') ? 'border-tennis-yellow shadow-[0_0_15px_rgba(223,255,79,0.3)]' : 'border-slate-700'
              }`}>
                <i className={`fa-solid ${step.icon} ${getStatusColor(step.id)} text-lg`}></i>
              </div>
              <span className={`mt-3 text-sm font-medium ${getStatusColor(step.id)}`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center text-slate-400">
        {status === ProcessingStatus.UPLOADING && <p>Sending video to RallyCoach secure storage...</p>}
        {status === ProcessingStatus.INFERENCE && <p>Running CV models: Detecting ball trajectory and player skeletons...</p>}
        {status === ProcessingStatus.ANALYZING && <p>Gemini LLM generating your personalized coaching plan...</p>}
        {status === ProcessingStatus.COMPLETED && <p className="text-tennis-yellow">Analysis Complete!</p>}
      </div>
    </div>
  );
};

export default ProcessingPipeline;
