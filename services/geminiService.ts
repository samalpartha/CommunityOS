import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { IncidentReport, SkillLesson } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * FEATURE: Analyze images
 * Model: gemini-3-pro-preview
 */
export const analyzeFixImage = async (base64Image: string): Promise<IncidentReport> => {
  try {
    const modelId = "gemini-3-pro-preview"; 

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
    return {
      category: "Maintenance Issue (AI Unavailable)",
      severity: "Unknown",
      description: "Could not analyze image automatically."
    };
  }
};

/**
 * FEATURE: Think more when needed - Life Skills
 * Model: gemini-3-pro-preview
 * Use Case: Generating safe, structured life skill lessons triggered by real events.
 */
export const generateLifeSkillLesson = async (context: string): Promise<SkillLesson> => {
    try {
        const modelId = "gemini-3-pro-preview";

        const prompt = `
            Create a micro-learning lesson for a community volunteer app triggered by the user fixing: "${context}".
            Title: A catchy title about mastering this skill (e.g., "Electrical Safety 101" if context is Broken Light).
            Steps: 3 concise, actionable steps to understand/fix/report this issue safely.
            Checklist: 3 specific safety checks the user should perform right now.
        `;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }, 
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
            title: "Safety Basics",
            steps: ["Assess the area", "Report accurately", "Verify completion"],
            checklist: ["Is it safe?", "Did you take a photo?", "Is the location correct?"]
        };
    }
};

/**
 * FEATURE: Fast AI responses
 * Model: gemini-2.5-flash-lite
 */
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
 * FEATURE: Control image aspect ratios
 * Model: gemini-3-pro-image-preview
 */
export const generateImpactBadge = async (prompt: string, aspectRatio: string = "1:1"): Promise<string | null> => {
    try {
        const modelId = 'gemini-3-pro-image-preview';
        
        const response = await ai.models.generateContent({
            model: modelId,
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio as any, 
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
        console.error("Image Gen Error:", error);
        return null;
    }
}

/**
 * FEATURE: Create conversational voice apps (Live API)
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

    async connect(onStatusChange: (status: string) => void) {
        try {
            onStatusChange("connecting");
            this.currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.session = await ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: "You are a friendly senior citizen named 'Elder AI' helping a volunteer practice a check-in call.",
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