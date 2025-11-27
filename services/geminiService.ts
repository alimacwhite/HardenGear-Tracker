import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult } from "../types";

// Helper to convert file to base64
export const fileToGenerativePart = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeMachineImage = async (base64Image: string): Promise<GeminiAnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // Fallback mock for UI demonstration if no key is present, though env is expected.
        console.warn("No API Key found. Returning mock data.");
        return {
            make: "Unknown (AI Unavailable)",
            type: "Garden Machinery",
            observedCondition: "Could not analyze."
        };
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming JPEG for simplicity from canvas/input
              data: base64Image
            }
          },
          {
            text: "Analyze this image of garden machinery. Identify the machine type (e.g., Lawnmower, Chainsaw, Leaf Blower), the likely manufacturer/make, and a brief summary of its visual condition (dirt, rust, damage)."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            make: { type: Type.STRING, description: "The brand or manufacturer name if visible, else 'Unknown'" },
            type: { type: Type.STRING, description: "The type of machine" },
            observedCondition: { type: Type.STRING, description: "Brief visual assessment of condition" }
          },
          required: ["make", "type", "observedCondition"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as GeminiAnalysisResult;
    }
    
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
        make: "",
        type: "Unknown Machine",
        observedCondition: "AI Analysis failed."
    };
  }
};
