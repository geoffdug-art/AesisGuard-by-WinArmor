
import { GoogleGenAI, Type } from "@google/genai";
import { Threat } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLatestThreats = async (): Promise<Threat[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Identify the top 8 most significant emerging malware, trojans, or spyware threats of the current month. Include their names, types, a short description, and severity (Critical, High, Medium).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              severity: { type: Type.STRING },
              description: { type: Type.STRING },
              lastSeen: { type: Type.STRING }
            },
            required: ["name", "type", "severity", "description", "lastSeen"]
          }
        }
      }
    });

    // The GenerateContentResponse object features a text property (not a method).
    const text = response.text?.trim();
    if (!text) return [];
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Error parsing threat JSON:", e);
      return [];
    }
  } catch (error) {
    console.error("Error fetching threats:", error);
    return [];
  }
};

export const analyzeSecurityLog = async (log: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this simulated security scan log and provide a professional security assessment in 3 bullet points: \n\n ${log}`,
    });
    // The GenerateContentResponse object features a text property (not a method).
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Error analyzing security log:", error);
    return "Analysis failed due to a service error.";
  }
};
