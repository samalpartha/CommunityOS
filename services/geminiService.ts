import { GoogleGenAI, Type } from "@google/genai";
import { IncidentReport, SkillLesson } from "../types";

// Initialize Gemini Client
// NOTE: API Key is expected to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an image (base64) for a "Fix Bounty" mission.
 * Identifies the object, potential hazard level, and category.
 */
export const analyzeFixImage = async (base64Image: string): Promise<IncidentReport> => {
  try {
    const modelId = "gemini-2.5-flash-image"; // Efficient vision model

    const prompt = `
      Analyze this image for a civic maintenance report. 
      Identify the main issue (e.g., Pothole, Graffiti, Broken Light, Trash).
      Assess the severity (Low, Medium, High, Critical).
      Provide a brief 1-sentence description.
      
      Return JSON format.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING },
                severity: { type: Type.STRING },
                description: { type: Type.STRING }
            }
        }
      },
    });

    if (response.text) {
        return JSON.parse(response.text) as IncidentReport;
    }
    throw new Error("No analysis returned");

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback for demo if API key fails or quota exceeded
    return {
      category: "Maintenance Issue (AI Unavailable)",
      severity: "Unknown",
      description: "Could not analyze image automatically. Please describe manually."
    };
  }
};

/**
 * Generates a quick "Life Skill" lesson based on context.
 */
export const generateLifeSkillLesson = async (topic: string): Promise<SkillLesson> => {
    try {
        const modelId = "gemini-3-flash-preview";

        const prompt = `
            Create a micro-learning lesson for a community volunteer app.
            Topic: ${topic}.
            Structure: 3 actionable steps and a 3-item safety checklist.
            Keep it very brief and mobile-friendly.
        `;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                        checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as SkillLesson;
        }
         throw new Error("No lesson returned");

    } catch (error) {
        console.error("Gemini Skill Gen Error:", error);
        return {
            title: "Quick Guide",
            steps: ["Step 1: Assess safety", "Step 2: Take action", "Step 3: Verify"],
            checklist: ["Gloves worn?", "Area clear?", "Photo taken?"]
        };
    }
};

/**
 * Generates conversation starters for "Lonely Minutes" missions.
 */
export const generateConversationStarters = async (topic: string): Promise<string[]> => {
    try {
        const modelId = "gemini-3-flash-preview";
        const prompt = `Generate 3 friendly, low-pressure conversation starters for a volunteer calling a senior citizen. Topic: ${topic}. Return a JSON array of strings.`;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as string[];
        }
        return ["How is your day going?", "What's your favorite thing about this topic?", "Tell me more about that."];
    } catch (e) {
        return ["How are you feeling today?", "Any interesting news?", "How is the weather?"];
    }
}
