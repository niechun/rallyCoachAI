
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are RallyCoach AI, an elite world-class tennis coach with expertise in biomechanics and match strategy. 
Your task is to analyze tennis match footage (provided via descriptions or frames) and provide professional, actionable feedback.
Be specific about footwork, racket path, strike point, and court positioning.
Use professional tennis terminology (e.g., closed-stance, unit turn, split step, inside-out forehand).
`;

export const analyzeMatchWithGemini = async (
  prompt: string,
  frames: string[] = []
): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const contents = frames.length > 0 
    ? { 
        parts: [
          ...frames.map(f => ({ inlineData: { mimeType: 'image/jpeg', data: f.split(',')[1] } })),
          { text: prompt }
        ] 
      }
    : prompt;

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            technicalScore: { type: Type.NUMBER, description: "Technical execution score 0-100" },
            tacticalScore: { type: Type.NUMBER, description: "Strategic awareness score 0-100" },
            summary: { type: Type.STRING, description: "Brief overview of the performance" },
            strengths: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Key things the player did well"
            },
            improvements: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Actionable technical fixes"
            },
            drills: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Recommended practice drills"
            }
          },
          required: ["technicalScore", "tacticalScore", "summary", "strengths", "improvements", "drills"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
