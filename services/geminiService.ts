import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult, MachineDetails } from "../types";

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

export const analyzeMachineImage = async (base64Images: string[]): Promise<GeminiAnalysisResult> => {
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

    // Construct image parts for all provided photos
    const imageParts = base64Images.map(img => ({
        inlineData: {
            mimeType: "image/jpeg",
            data: img
        }
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          ...imageParts,
          {
            text: "Analyze these images of garden machinery. Identify the machine type (e.g., Lawnmower, Chainsaw, Leaf Blower), the likely manufacturer/make, and a brief summary of its visual condition (dirt, rust, damage)."
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

export const generateRepairPlan = async (machine: MachineDetails, issues: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return "AI Service Unavailable for Repair Plan.";

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Act as an expert garden machinery mechanic.
      Machine: ${machine.make} ${machine.model} (${machine.type}).
      Reported Issues: "${issues}".
      
      Provide a concise, step-by-step technical repair plan/process to diagnose and fix these issues. 
      Format as a numbered list. Keep it practical and safe.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Could not generate repair plan.";

  } catch (error) {
    console.error("Repair plan generation failed:", error);
    return "Failed to generate repair plan due to an error.";
  }
};

export const lookupAddressFromPostcode = async (postcode: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return "";

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `What is the primary street address or area associated with the UK postcode ${postcode}? Return ONLY the address (Street, City). Do not include the postcode in the output.`,
      config: {
        tools: [{ googleMaps: {} }],
      }
    });

    // Clean up potential conversational filler from the model
    let address = response.text || "";
    // Remove simplistic prefixes if they appear
    address = address.replace(/^The address is[:\s]*/i, "").trim();
    
    return address;

  } catch (error) {
    console.error("Address lookup failed:", error);
    return "";
  }
};