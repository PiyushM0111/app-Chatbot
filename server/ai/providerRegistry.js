// Multi-Provider AI Fallback Registry & Failover Chain
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getIntelligentLocalBrain } from './knowledgeEngine.js';

export class ProviderRegistry {
  constructor() {
    this.geminiClient = null;
    this.initProviders();
  }

  initProviders() {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here' && geminiKey.trim().length > 10) {
      try {
        this.geminiClient = new GoogleGenerativeAI(geminiKey.trim());
      } catch (err) {
        console.warn('Gemini client initialization error:', err.message);
      }
    }
  }

  isGeminiConfigured() {
    return !!this.geminiClient;
  }

  // Execute prompt across provider failover chain
  async generateCompletion({ prompt, systemInstruction, history = [], modelName = 'gemini-1.5-flash', temperature = 0.7, language = 'en', mode = 'general' }) {
    // 1. Try Gemini Provider if configured
    if (this.geminiClient) {
      try {
        const model = this.geminiClient.getGenerativeModel({
          model: modelName || 'gemini-1.5-flash',
          generationConfig: {
            temperature: typeof temperature === 'number' ? temperature : 0.7,
            maxOutputTokens: 2048,
          },
          systemInstruction: systemInstruction || undefined
        });

        const chat = model.startChat({
          history: history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
          }))
        });

        const result = await Promise.race([
          chat.sendMessage(prompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error('AI Provider Timeout (15s)')), 15000))
        ]);

        const text = result.response.text();
        if (text && text.trim()) {
          return {
            text: text.trim(),
            provider: 'google-gemini',
            model: modelName
          };
        }
      } catch (err) {
        console.warn(`Upstream Gemini provider error (${err.message}). Falling back to Local Engine.`);
      }
    }

    // 2. Fallback to Local Knowledge Engine
    const fallbackText = getIntelligentLocalBrain(prompt, language, mode);
    return {
      text: fallbackText,
      provider: 'nexus-local-knowledge-engine',
      model: 'nexus-core-brain'
    };
  }
}

export const providerRegistry = new ProviderRegistry();
