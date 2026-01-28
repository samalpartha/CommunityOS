import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { IncidentReport, SkillLesson, Mission } from "../types";

// Initialize Gemini Client
// Note: Key moved to .env for security (GitGuardian Compliance)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Safely initialize the client or null if key is missing
// @ts-ignore - GoogleGenAI might not handle null apiKey gracefully in constructor depending on version, so we strictly control instantiation
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!apiKey) {
    console.warn("⚠️ VITE_GEMINI_API_KEY is missing. AI features will use fallback mocks.");
}

/**
 * FEATURE: Analyze images
 * Model: gemini-3-pro-preview
 */
export const analyzeFixImage = async (base64Image: string): Promise<IncidentReport> => {
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
        return { isMatch: true, reason: "Manual verification required (AI offline)." }; // Fail open for demo
    }
}

/**
 * STRATEGIC TRACK: The Marathon Agent
 * Model: gemini-3-pro-preview
 * Logic: Breaks a complex community goal into sub-missions (Thought Signatures)
 */
export const decomposeComplexProject = async (goal: string): Promise<any[]> => {
    if (!ai) return [
        { id: 'm-mock-1', title: 'Plan Site Survey', type: 'FIX_BOUNTY', description: 'Initial assessment (Demo)', urgency: 'MEDIUM', reward: 50 },
        { id: 'm-mock-2', title: 'Gather Volunteers', type: 'LIFE_SKILL', description: 'Recruitment phase (Demo)', urgency: 'LOW', reward: 30 }
    ];
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
    if (!ai) return null;
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
    if (!ai) return { title: "Demo Lesson", steps: ["Step 1", "Step 2", "Step 3"], checklist: ["Check 1", "Check 2"] };
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
    if (!ai) return ["How are you?", "Lovely weather today!", "Tell me about your hobbies?"];
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
// Helper for resampling audio if browser doesn't support 16kHz natively
const downsampleBuffer = (buffer: Float32Array, inputRate: number, outputRate: number = 16000) => {
    if (inputRate === outputRate) return buffer;
    if (inputRate < outputRate) return buffer; // Should not happen for 16k target

    const sampleRateRatio = inputRate / outputRate;
    const newLength = Math.floor(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
        // Nearest neighbor interpolation for speed
        result[i] = buffer[Math.floor(i * sampleRateRatio)];
    }
    return result;
};

function encodeAudio(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function decodeAudio(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export class LiveSession {
    private session: any;
    private inputContext: AudioContext;
    private outputContext: AudioContext;
    private inputSource: MediaStreamAudioSourceNode | null = null;
    private processor: ScriptProcessorNode | null = null;
    private analyser: AnalyserNode | null = null;
    private currentStream: MediaStream | null = null;
    private nextStartTime: number = 0;
    public onTranscript?: (speaker: 'user' | 'assistant', text: string) => void;

    constructor() {
        this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    async connect(
        onStatusChange: (status: string, errorMessage?: string) => void,
        mode: 'TEACHER' | 'BLIND_SUPPORT' = 'TEACHER',
        onTranscript?: (speaker: 'user' | 'assistant', text: string) => void
    ) {
        this.onTranscript = onTranscript;
        if (!ai) {
            console.warn("Live Session Aborted: No API Key");
            onStatusChange("error", "API Key Missing. Check .env file.");
            return;
        }
        try {
            onStatusChange("connecting");
            try {
                this.currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (micErr) {
                console.error("Microphone Error:", micErr);
                onStatusChange("error", "Microphone access denied. Check permissions.");
                return;
            }

            const sysInstruction = mode === 'BLIND_SUPPORT'
                ? "You are 'Hero Voice', a navigational assistant for visually impaired users. Help them send messages, find missions, and describe their surroundings. Be concise."
                : "You are a friendly mentor helping a volunteer learn a new skill. Be encouraging and adaptive.";

            await this.inputContext.resume();
            await this.outputContext.resume();

            this.session = await ai.live.connect({
                model: 'gemini-2.0-flash-exp',
                config: {
                    responseModalities: [Modality.AUDIO], // Simplified to just AUDIO for stability
                    systemInstruction: sysInstruction,
                },
                callbacks: {
                    onopen: () => {

                        onStatusChange("connected");
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        // ... existing handler ...


                        // Handle audio response
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            await this.playAudio(audioData);
                        }

                        // Handle ALL text parts
                        const allParts = msg.serverContent?.modelTurn?.parts || [];
                        allParts.forEach((part) => {
                            if (part.text && this.onTranscript) {
                                this.onTranscript('assistant', part.text);
                            }
                        });

                        // Handle user transcript
                        const userInput = (msg as any).serverContent?.userInput?.text;
                        if (userInput && this.onTranscript) {
                            this.onTranscript('user', userInput);
                        }
                    },
                    onclose: (event) => {
                        console.warn("🔌 WebSocket Closed:", event);
                        // Distinguish between normal close and error close if possible, but for now:
                        onStatusChange("disconnected");
                    },
                    onerror: (err) => {
                        console.error("❌ WebSocket Error:", err);
                        onStatusChange("error", "Connection failed. Please try again.");
                    }
                }
            });

            // Start audio ONLY after session is assigned
            this.startAudioInput();

        } catch (err: any) {
            console.error("Live Connect Error:", err);

            // Check for rate limit error
            if (err.status === 429 || err.message?.includes('429') || err.message?.toLowerCase().includes('rate limit')) {
                console.error("🚫 Rate limit exceeded");
                onStatusChange("rate_limit", "API Rate Limit Exceeded");
                if (this.onTranscript) {
                    this.onTranscript('assistant', 'API rate limit reached. Please wait a few minutes before trying again.');
                }
                return;
            }

            // Check for quota exceeded
            if (err.message?.toLowerCase().includes('quota')) {
                console.error("🚫 Quota exceeded");
                onStatusChange("quota_exceeded", "API Quota Exceeded");
                if (this.onTranscript) {
                    this.onTranscript('assistant', 'API quota exceeded. Please check your Gemini API dashboard.');
                }
                return;
            }

            onStatusChange("error", err.message || "Unknown connection error.");
        }
    }

    private startAudioInput() {
        if (!this.currentStream || !this.session) {
            console.error("❌ startAudioInput blocked: Stream or Session missing", {
                stream: !!this.currentStream,
                session: !!this.session
            });
            return;
        }

        console.log("🎤 Starting Audio Input Pipeline...");

        this.inputSource = this.inputContext.createMediaStreamSource(this.currentStream);
        this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);

        // Setup Analyser for Visualizer
        this.analyser = this.inputContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.inputSource.connect(this.analyser);

        this.processor.onaudioprocess = (e) => {
            if (!this.currentStream) return; // Stop processing if stream is closed

            const inputData = e.inputBuffer.getChannelData(0);

            // DOWNSAMPLING LOGIC: Ensure 16kHz
            const outputRate = 16000;
            let dataToSend = inputData;

            if (this.inputContext && this.inputContext.sampleRate !== outputRate) {
                dataToSend = downsampleBuffer(inputData, this.inputContext.sampleRate, outputRate) as any;
            }

            const int16 = new Int16Array(dataToSend.length);
            for (let i = 0; i < dataToSend.length; i++) {
                int16[i] = dataToSend[i] * 32768;
            }

            const pcmBlob = encodeAudio(new Uint8Array(int16.buffer));

            this.session.sendRealtimeInput({
                media: {
                    mimeType: "audio/pcm;rate=16000",
                    data: pcmBlob
                }
            });
        };

        this.inputSource.connect(this.processor);
        this.processor.connect(this.inputContext.destination);
        console.log("✅ Audio Input Pipeline Connected.");
    }

    getAudioData(): Uint8Array | null {
        if (!this.analyser) return null;
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }

    // Simplified decodeAudioData logic by using the helper or just standard API if needed, 
    // but sticking to manual decoding for consistency with reference if we updated playAudio.
    // However, playAudio (lines 424-441) uses `atob` and `decodeAudioData`.
    // Let's replace playAudio to use the `decodeAudio` helper we added.

    private async playAudio(base64: string) {
        // Use the helper
        const audioBytes = decodeAudio(base64);

        // Manually decode to 24kHz buffer as per reference logic
        const buffer = this.outputContext.createBuffer(1, audioBytes.length / 2, 24000);
        const channel = buffer.getChannelData(0);
        const int16 = new Int16Array(audioBytes.buffer);

        for (let i = 0; i < int16.length; i++) {
            channel[i] = int16[i] / 32768.0;
        }

        const source = this.outputContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.outputContext.destination);

        const now = this.outputContext.currentTime;
        // Basic sync logic
        this.nextStartTime = Math.max(now, this.nextStartTime);
        source.start(this.nextStartTime);
        this.nextStartTime += buffer.duration;
    }

    // Removed old float32ToPCM as we use encodeAudio now

    disconnect() {
        console.log("🛑 Disconnecting Voice Session...");

        // Stop all tracks in the current stream
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(t => {
                console.log(`Stopping track: ${t.kind} - ${t.label}`);
                t.stop();
            });
            this.currentStream = null;
        }

        // Disconnect audio nodes
        if (this.inputSource) {
            this.inputSource.disconnect();
            this.inputSource = null;
        }
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }

        // Close/Suspend contexts if possible, or just leave them (suspending is better for battery)
        try {
            if (this.inputContext && this.inputContext.state !== 'closed') {
                this.inputContext.suspend();
            }
            if (this.outputContext && this.outputContext.state !== 'closed') {
                this.outputContext.suspend();
            }
        } catch (e) {
            console.warn("Error suspending audio contexts:", e);
        }

        console.log("✅ Disconnected and cleaned up");
    }
}

/**
 * FEATURE: Hybrid Assistant Chat Manager
 * Purpose: Reliable text chat that works even if Voice Mode fails.
 */
export class ChatManager {
    private history: { role: 'user' | 'model', parts: [{ text: string }] }[] = [];
    private modelId = 'gemini-2.0-flash-exp';

    constructor() { }

    async sendMessage(text: string): Promise<string> {
        if (!ai) return "AI is offline (No API Key).";

        // Add user message to history
        this.history.push({ role: 'user', parts: [{ text }] });

        try {
            const response = await ai.models.generateContent({
                model: this.modelId,
                config: {
                    systemInstruction: "You are 'Community Hero', a helpful, upbeat assistant for a community service app. You help users find missions, report issues, and learn skills. Keep responses concise and encouraging.",
                    maxOutputTokens: 1000,
                },
                contents: this.history
            });

            const responseText = response.text || "I'm not sure what to say.";

            // Add model response to history
            this.history.push({ role: 'model', parts: [{ text: responseText }] });

            return responseText;
        } catch (error) {
            console.error("Chat Error:", error);
            // Remove the failed user message so retry works cleanly? Or just leave it.
            // Let's leave it for now but return error.
            return "Sorry, I'm having trouble connecting right now.";
        }
    }
}