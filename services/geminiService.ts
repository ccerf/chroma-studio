
import { GoogleGenAI, Type } from "@google/genai";
import { AIPaletteResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePaletteFromPrompt = async (prompt: string): Promise<AIPaletteResponse> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a beautiful 5-color palette based on this prompt: "${prompt}". Provide hex codes, names, and a brief reason for each color selection.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          paletteName: { type: Type.STRING },
          colors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING, description: "HEX code including #" },
                name: { type: Type.STRING, description: "Creative name for the color" },
                reason: { type: Type.STRING, description: "Why this color fits the theme" }
              },
              required: ["hex", "name", "reason"]
            }
          }
        },
        required: ["paletteName", "colors"]
      }
    }
  });

  const text = response.text || "";
  return JSON.parse(text) as AIPaletteResponse;
};
