
import { GoogleGenAI, Type } from "@google/genai";
import { Threat } from "../types";

// Always use { apiKey: process.env.API_KEY } for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches the latest security threats using Gemini.
 * Uses gemini-3-pro-preview for high-quality reasoning and identification.
 */
export const getLatestThreats = async (): Promise<Threat[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: "Identify the top 8 most significant emerging malware, trojans, or spyware threats of the current month. For each threat, provide: name, type (Malware, Trojan, Spyware, Ransomware), a short description, severity (Critical, High, Medium), lastSeen date, and its primary geographic origin including country name and approximate latitude/longitude coordinates.",
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
              lastSeen: { type: Type.STRING },
              origin: {
                type: Type.OBJECT,
                properties: {
                  country: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER }
                },
                required: ["country", "lat", "lng"]
              }
            },
            required: ["name", "type", "severity", "description", "lastSeen", "origin"]
          }
        }
      }
    });

    // Use .text property to extract generated content
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

/**
 * Analyzes security logs using Gemini.
 */
export const analyzeSecurityLog = async (log: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this simulated security scan log and provide a professional security assessment in 3 bullet points: \n\n ${log}`,
    });
    // Use .text property for the generated response
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Error analyzing security log:", error);
    return "Analysis failed due to a service error.";
  }
};
