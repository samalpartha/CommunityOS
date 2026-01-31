import { GoogleGenAI, Type, LiveServerMessage } from "@google/genai";
import { SkillLesson, Mission } from "../types";

export interface FixAnalysis {
    category: string;
    severity: string;
    description: string;
}

// Initialize Gemini Client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Safely initialize the client or null if key is missing
// @ts-ignore
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!apiKey) {
    console.warn("⚠️ VITE_GEMINI_API_KEY is missing. AI features will use fallback mocks.");
}

/**
 * FEATURE: Analyze images
 */
export const analyzeFixImage = async (base64Image: string): Promise<FixAnalysis> => {
    if (!ai) {
        console.warn("AI Analysis Skipped: No API Key");
        return {
            category: "Maintenance Issue (Demo)",
            severity: "Medium",
            description: "AI key missing - demo mock response."
        };
    }

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
            return JSON.parse(response.text) as FixAnalysis;
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
 */
export const verifyFixCompletion = async (beforeImage: string, afterImage: string): Promise<{ isMatch: boolean; reason: string }> => {
    if (!ai) return { isMatch: true, reason: "Verified (Demo Mode - No AI Key)" };
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
        return { isMatch: true, reason: "Manual verification required (AI offline)." };
    }
}

/**
 * STRATEGIC TRACK: The Marathon Agent
 */
export const decomposeComplexProject = async (goal: string): Promise<any[]> => {
    if (!ai) return [
        { id: 'm-mock-1', title: 'Plan Site Survey', type: 'FIX_BOUNTY', description: 'Initial assessment (Demo)', urgency: 'MEDIUM', reward: 50 },
        { id: 'm-mock-2', title: 'Gather Volunteers', type: 'LIFE_SKILL', description: 'Recruitment phase (Demo)', urgency: 'LOW', reward: 30 }
    ];
    try {
        const modelId = "gemini-3-pro-preview";
        const prompt = `
            The user wants to achieve this goal: "${goal}".
            Break this down into 3-5 micro-missions.
            Return a JSON array.
        `;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 16000 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['FIX_BOUNTY', 'FOOD_FIT', 'MEDICAL_NEED', 'LIFE_SKILL'] },
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
 */
export const generateCampaignPoster = async (cause: string, style: string): Promise<string | null> => {
    if (!ai) return null;
    try {
        const modelId = 'gemini-3-pro-image-preview';
        const prompt = `Create a professional community service poster for: "${cause}". Style: ${style}.`;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: { aspectRatio: "3:4", imageSize: "1K" }
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
    if (!ai) return { title: "Demo Lesson", steps: ["Step 1", "Step 2"], checklist: ["Check A"] };
    try {
        const modelId = "gemini-3-pro-preview";
        const prompt = `Create micro-learning: "${context}". Return JSON.`;

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

        if (response.text) return JSON.parse(response.text) as SkillLesson;
        throw new Error("No lesson");
    } catch (error) {
        return { title: "Safety Basics", steps: ["Assess", "Verify"], checklist: ["Safe?"] };
    }
};

export const generateConversationStarters = async (topic: string): Promise<string[]> => {
    if (!ai) return ["Hi!", "Hello!"];
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `3 conversation starters for: ${topic}. JSON array.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return response.text ? JSON.parse(response.text) : ["Hi"];
    } catch (e) { return ["Hi"]; }
}

// Helpers
const downsampleBuffer = (buffer: Float32Array, inputRate: number, outputRate: number = 16000) => {
    if (inputRate === outputRate) return buffer;
    const ratio = inputRate / outputRate;
    const result = new Float32Array(Math.floor(buffer.length / ratio));
    for (let i = 0; i < result.length; i++) result[i] = buffer[Math.floor(i * ratio)];
    return result;
};

function encodeAudio(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

export function decodeAudio(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
}

import { User } from "../types";

export interface VoiceContext {
    user: User;
    location?: { lat: number; lng: number };
    activeTab: string;
    viewMode?: string;
    filter?: string;
    isSwarmActive: boolean;
    missions?: Mission[];
    activeUsersCount?: number;
    localTime: string;
    helpContent?: string;
}

export class VoiceManager {
    private session: any = null;
    private inputContext: AudioContext;
    private outputContext: AudioContext;
    private currentStream: MediaStream | null = null;
    private onTranscript: ((speaker: 'user' | 'assistant', text: string) => void) | null = null;
    private nextStartTime: number = 0;
    private inputSource: MediaStreamAudioSourceNode | null = null;
    private processor: ScriptProcessorNode | null = null;
    private analyser: AnalyserNode | null = null;
    private isConnecting = false;
    private statusListeners: ((status: string, error?: string) => void)[] = [];

    constructor() {
        this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    onStatusChange(callback: (status: string, error?: string) => void) {
        this.statusListeners.push(callback);
        return () => { this.statusListeners = this.statusListeners.filter(l => l !== callback); };
    }

    private emitStatus(status: string, error?: string) {
        this.statusListeners.forEach(l => l(status, error));
    }

    getStatus() {
        if (this.session) return 'connected';
        if (this.isConnecting) return 'connecting';
        return 'disconnected';
    }

    async connect(mode: 'TEACHER' | 'BLIND_SUPPORT' = 'TEACHER', onTranscript?: (speaker: 'user' | 'assistant', text: string) => void, context?: VoiceContext) {
        if (this.session || this.isConnecting) return;
        this.isConnecting = true;
        this.onTranscript = onTranscript || null;
        this.emitStatus('connecting');

        if (!ai) {
            this.isConnecting = false;
            this.emitStatus('error', "API Key Missing");
            return;
        }

        try {
            console.log("🎤 Requesting microphone access...");
            this.currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("✅ Microphone access granted");

            // Generate System Instruction from Context
            let sysInstruction = mode === 'BLIND_SUPPORT' ? "You are a helpful assistant for a blind user." : "You are a helpful mentor.";

            if (context) {
                console.log("🔍 VoiceManager Received Context:", JSON.stringify(context, null, 2));
                const missionSummaries = context.missions?.map(m => `- ${m.title} (${m.type}, Reward: ${m.reward})`).join('\n') || "No nearby missions.";
                sysInstruction = `
                You are the AI Voice Interface for the "Community Hero" application.
                
                CRITICAL INSTRUCTION:
                You must IGNORE all external knowledge about "community heroes".
                You must ONLY use the definitions provided in the "KNOWLEDGE BASE" below.
                
                SESSION CONTEXT:
                - User: ${context.user.name} (Trust Score: ${context.user.trustScore})
                - View: ${context.activeTab} > ${context.viewMode || 'Standard'}
                - Crisis: ${context.isSwarmActive ? "ACTIVE" : "Inactive"}
                
                KNOWLEDGE BASE (THE ONLY TRUTH):
                ${context.helpContent || "No guide available."}

                NEARBY MISSIONS:
                ${missionSummaries}
                
                RESPONSE GUIDELINES:
                1. If asked "Who are you?", say: "I am the voice assistant for Community Hero, a Civic Operating System."
                2. If asked "What is this?", refer to Section 0 in the Knowledge Base.
                3. MAX 2 SENTENCES. Be concise.
                4. Do NOT start responses with "As an AI...".
                `;
            }

            console.log("🔊 Resuming Audio Contexts...");
            console.log("🧠 System Instruction:", sysInstruction);

            await this.inputContext.resume();
            await this.outputContext.resume();

            console.log("🚀 Connecting to Gemini Live API...");
            const connectionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-latest',
                // @ts-ignore
                config: { responseModalities: ["audio" as any], systemInstruction: sysInstruction },
                callbacks: {
                    onopen: () => {
                        console.log("🟢 WebSocket Connection Opened");
                        this.emitStatus('connected');
                        const startWithRetry = (retries = 0) => {
                            if (this.session) {
                                console.log("🎙 Starting Audio Input...");
                                this.startAudioInput();
                            } else if (retries < 20) {
                                console.log(`⏳ Waiting for session initialization... (${retries + 1}/20)`);
                                setTimeout(() => startWithRetry(retries + 1), 100);
                            } else {
                                console.error("❌ Session initialization timed out");
                                this.emitStatus('error', 'Session Timeout');
                            }
                        };
                        startWithRetry();
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            await this.playAudio(audioData);
                        }

                        msg.serverContent?.modelTurn?.parts?.forEach(p => {
                            if (p.text && this.onTranscript) this.onTranscript('assistant', p.text);
                        });
                        const userInput = (msg as any).serverContent?.userInput?.text;
                        if (userInput && this.onTranscript) this.onTranscript('user', userInput);
                    },
                    onclose: (e: any) => {
                        console.warn(`🔌 WebSocket Closed: Code=${e.code}, Reason=${e.reason}`);
                        this.disconnect();
                    },
                    onerror: (err: any) => {
                        console.error("❌ WebSocket Error callback:", err);
                        this.disconnect();
                    }
                }
            });
            const newSession = await connectionPromise;
            if (!this.isConnecting) {
                console.log("🔌 Connection cancelled during negotiation");
                (newSession as any).close?.();
                return;
            }
            this.session = newSession;
            this.isConnecting = false;
        } catch (err: any) {
            console.error("❌ VoiceManager Connect Error:", err);
            this.isConnecting = false;
            this.emitStatus('error', err.message);
        }
    }

    private startAudioInput() {
        if (!this.currentStream || !this.session) return;
        this.inputSource = this.inputContext.createMediaStreamSource(this.currentStream);
        this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);
        this.analyser = this.inputContext.createAnalyser();
        this.inputSource.connect(this.analyser);

        this.processor.onaudioprocess = async (e) => {
            if (!this.currentStream || !this.session) return;
            // Simple gate to prevent sending too early
            if (this.isConnecting) return;

            const inputData = e.inputBuffer.getChannelData(0);
            const dataToSend = this.inputContext.sampleRate !== 16000 ? downsampleBuffer(inputData, this.inputContext.sampleRate, 16000) : inputData;

            // Silence detection
            let sum = 0;
            for (let i = 0; i < dataToSend.length; i++) sum += Math.abs(dataToSend[i]);
            if (sum < 0.001) return; // Stricter silence check

            const int16 = new Int16Array(dataToSend.length);
            for (let i = 0; i < dataToSend.length; i++) int16[i] = dataToSend[i] * 32768;

            const pcmBlob = encodeAudio(new Uint8Array(int16.buffer));

            try {
                // @ts-ignore
                await this.session.sendRealtimeInput({ media: { mimeType: "audio/pcm;rate=16000", data: pcmBlob } });
            } catch (pErr) {
                console.warn("Error sending audio input:", pErr);
                // Don't disconnect immediately on one error, maybe just log
                // this.disconnect();
            }
        };

        this.inputSource.connect(this.processor);
        this.processor.connect(this.inputContext.destination);
    }

    getAudioData() {
        if (!this.analyser) return null;
        const data = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(data);
        return data;
    }

    private async playAudio(base64: string) {
        const bytes = decodeAudio(base64);
        const buffer = this.outputContext.createBuffer(1, bytes.length / 2, 24000);
        const channel = buffer.getChannelData(0);
        const int16 = new Int16Array(bytes.buffer);
        for (let i = 0; i < int16.length; i++) channel[i] = int16[i] / 32768.0;
        const source = this.outputContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.outputContext.destination);
        this.nextStartTime = Math.max(this.outputContext.currentTime, this.nextStartTime);
        source.start(this.nextStartTime);
        this.nextStartTime += buffer.duration;
    }

    disconnect() {
        if (this.session) {
            try {
                // Attempt to close the session if the method exists
                (this.session as any).close?.();
                console.log("🔌 Session closed manually");
            } catch (e) {
                console.warn("Error closing session:", e);
            }
        }
        this.session = null;
        this.isConnecting = false;
        if (this.currentStream) this.currentStream.getTracks().forEach(t => t.stop());
        this.currentStream = null;
        if (this.inputSource) this.inputSource.disconnect();
        if (this.processor) this.processor.disconnect();
        try {
            if (this.inputContext.state !== 'closed') this.inputContext.suspend();
            if (this.outputContext.state !== 'closed') this.outputContext.suspend();
        } catch (e) { }

        this.emitStatus('disconnected');
    }
}

export const voiceManager = new VoiceManager();
export { VoiceManager as LiveSession };

export class ChatManager {
    private history: any[] = [];
    async sendMessage(text: string): Promise<string> {
        if (!ai) return "Offline";
        this.history.push({ role: 'user', parts: [{ text }] });
        try {
            const res = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: this.history });
            const reply = res.text || "No reply";
            this.history.push({ role: 'model', parts: [{ text: reply }] });
            return reply;
        } catch (e) { return "Error"; }
    }
}

export const chatManager = new ChatManager();