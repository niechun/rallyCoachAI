
export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  INFERENCE = 'INFERENCE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface AnalysisResult {
  technicalScore: number;
  tacticalScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  drills: string[];
}

export interface VideoMetadata {
  name: string;
  size: number;
  duration?: number;
  previewUrl?: string;
}
