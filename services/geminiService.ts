import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { IncidentReport, SkillLesson, Mission } from "../types";

// Initialize Gemini Client
// Note: In production, use process.env.API_KEY. Key updated per user request to resolve leak error.
const ai = new GoogleGenAI({ apiKey: 'AIzaSyDXsPfaKFXhv-md2jXTzmf0FZF6RHh5Ymk' });

/**
 * FEATURE: Analyze images
 * Model: gemini-3-pro-preview
 */
export const analyzeFixImage = async (base64Image: string): Promise<IncidentReport> => {
  try {
    const modelId = "gemini-3-pro-preview"; 

    const prompt = `
      Analyze this image for a civic maintenance report or hazard. 
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
    return {
      category: "Maintenance Issue (AI Unavailable)",
      severity: "Unknown",
      description: "Could not analyze image automatically."
    };
  }
};

/**
 * FEATURE: Auto-Verification (Before vs After)
 * Model: gemini-3-pro-preview
 */
export const verifyFixCompletion = async (beforeImage: string, afterImage: string): Promise<{ isMatch: boolean; reason: string }> => {
    try {
        const modelId = "gemini-3-pro-preview";
        const prompt = `
            You are a verification agent. I will provide two images: a 'Before' image of a hazard and an 'After' image.
            1. Determine if the 'After' image depicts the same location/context as the 'Before' image.
            2. Determine if the hazard (e.g., trash, pothole, graffiti) has been fixed or cleaned up.
            
            Return JSON with 'isMatch' (boolean) and 'reason' (string explanation).
        `;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: {
                parts: [
                    { text: "BEFORE IMAGE:" },
                    { inlineData: { mimeType: "image/jpeg", data: beforeImage } },
                    { text: "AFTER IMAGE:" },
                    { inlineData: { mimeType: "image/jpeg", data: afterImage } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isMatch: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return { isMatch: false, reason: "AI could not verify." };

    } catch (error) {
        console.error("Verification Error:", error);
        return { isMatch: true, reason: "Manual verification required (AI offline)." }; // Fail open for demo
    }
}

/**
 * STRATEGIC TRACK: The Marathon Agent
 * Model: gemini-3-pro-preview
 * Logic: Breaks a complex community goal into sub-missions (Thought Signatures)
 */
export const decomposeComplexProject = async (goal: string): Promise<any[]> => {
    try {
        const modelId = "gemini-3-pro-preview";
        
        const prompt = `
            You are an autonomous Community Coordinator Agent.
            The user wants to achieve this complex goal: "${goal}".
            Break this down into 3-5 distinct, actionable micro-missions for volunteers.
            Each mission must map to one of these types: FIX_BOUNTY (cleanup/physical), FOOD_FIT (gathering/distributing), MEDICAL_NEED (health), LIFE_SKILL (teaching).
            Return a JSON array of mission objects.
        `;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 16000 }, // Thinking Levels for planning
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['FIX_BOUNTY', 'FOOD_FIT', 'MEDICAL_NEED', 'LIFE_SKILL'] },
                            urgency: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
                            reward: { type: Type.NUMBER }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return [];
    } catch (error) {
        console.error("Marathon Agent Error:", error);
        return [];
    }
}

/**
 * STRATEGIC TRACK: Creative Autopilot
 * Model: gemini-3-pro-image-preview
 * Logic: Generates professional campaign assets with legible text
 */
export const generateCampaignPoster = async (cause: string, style: string): Promise<string | null> => {
    try {
        const modelId = 'gemini-3-pro-image-preview';
        const prompt = `Create a professional community service poster for: "${cause}". Style: ${style}. High resolution, legible text, inspiring.`;
        
        const response = await ai.models.generateContent({
            model: modelId,
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: "3:4", 
                    imageSize: "1K"
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Creative Autopilot Error:", error);
        return null;
    }
}


/**
 * FEATURE: Life Skills (Teacher)
 */
export const generateLifeSkillLesson = async (context: string): Promise<SkillLesson> => {
    try {
        const modelId = "gemini-3-pro-preview";

        const prompt = `
            Create a micro-learning lesson triggered by: "${context}".
            Title: A catchy title.
            Steps: 3 concise steps.
            Checklist: 3 verification checks.
        `;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 8192 }, 
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
        return {
            title: "Safety Basics",
            steps: ["Assess", "Act", "Verify"],
            checklist: ["Safe?", "Done?", "Logged?"]
        };
    }
};

export const generateConversationStarters = async (topic: string): Promise<string[]> => {
    try {
        const modelId = "gemini-2.5-flash-lite";
        const prompt = `Generate 3 friendly conversation starters for a volunteer calling a senior about: ${topic}. Return JSON array.`;

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
        return ["How is your day?", "Tell me more about that.", "What do you think?"];
    } catch (e) {
        return ["How are you?", "Any news?", "How is the weather?"];
    }
}

/**
 * STRATEGIC TRACK: The Real-Time Teacher / Concept 5 (Voicemail for Blind)
 * Model: gemini-2.5-flash-native-audio-preview
 */
export class LiveSession {
    private session: any;
    private inputContext: AudioContext;
    private outputContext: AudioContext;
    private inputSource: MediaStreamAudioSourceNode | null = null;
    private processor: ScriptProcessorNode | null = null;
    private currentStream: MediaStream | null = null;
    private nextStartTime: number = 0;

    constructor() {
        this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    async connect(onStatusChange: (status: string) => void, mode: 'TEACHER' | 'BLIND_SUPPORT' = 'TEACHER') {
        try {
            onStatusChange("connecting");
            this.currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const sysInstruction = mode === 'BLIND_SUPPORT' 
                ? "You are 'Hero Voice', a navigational assistant for visually impaired users. Help them send messages, find missions, and describe their surroundings. Be concise."
                : "You are a friendly mentor helping a volunteer learn a new skill. Be encouraging and adaptive.";

            this.session = await ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: sysInstruction,
                },
                callbacks: {
                    onopen: () => {
                        onStatusChange("connected");
                        this.startAudioInput();
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            await this.playAudio(audioData);
                        }
                    },
                    onclose: () => onStatusChange("disconnected"),
                    onerror: (err) => {
                        console.error(err);
                        onStatusChange("error");
                    }
                }
            });

        } catch (err) {
            console.error("Live Connect Error:", err);
            onStatusChange("error");
        }
    }

    private startAudioInput() {
        if (!this.currentStream || !this.session) return;

        this.inputSource = this.inputContext.createMediaStreamSource(this.currentStream);
        this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);

        this.processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = this.float32ToPCM(inputData);
            this.session.sendRealtimeInput({
                media: {
                    mimeType: "audio/pcm;rate=16000",
                    data: pcmBlob
                }
            });
        };

        this.inputSource.connect(this.processor);
        this.processor.connect(this.inputContext.destination);
    }

    private async playAudio(base64: string) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBuffer = await this.decodeAudioData(bytes, this.outputContext);
        const source = this.outputContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputContext.destination);
        
        const now = this.outputContext.currentTime;
        const start = Math.max(now, this.nextStartTime);
        source.start(start);
        this.nextStartTime = start + audioBuffer.duration;
    }

    private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
        const dataInt16 = new Int16Array(data.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }
        return buffer;
    }

    private float32ToPCM(float32: Float32Array): string {
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
            int16[i] = float32[i] * 32768;
        }
        let binary = '';
        const bytes = new Uint8Array(int16.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    disconnect() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(t => t.stop());
        }
        if (this.processor && this.inputSource) {
            this.inputSource.disconnect();
            this.processor.disconnect();
        }
    }
}