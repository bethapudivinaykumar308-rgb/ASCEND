import { GoogleGenAI } from '@google/genai';

/**
 * AIService - Core intelligence layer for ASCEND
 * Handles provider routing, model fallbacks, and robust error handling for Gemini API.
 */
export class AIService {
  private static instance: AIService;
  private genAI: GoogleGenAI | null = null;
  private apiKey: string = '';
  private primaryModel = 'gemini-3.8-flash';
  private fallbackModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];

  private constructor() {
    this.getClient();
  }

  private getClient(): GoogleGenAI {
    const currentKey = process.env.GEMINI_API_KEY || '';
    if (!this.genAI || this.apiKey !== currentKey) {
      this.apiKey = currentKey;
      this.genAI = new GoogleGenAI({
        apiKey: currentKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.genAI;
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Universal completion method with automated fallback routing and backoff.
   */
  public async callGeminiWithFallback(params: {
    contents: string;
    systemInstruction?: string;
    responseSchema?: any;
    responseMimeType?: string;
  }): Promise<{ text: string; modelUsed: string }> {
    const client = this.getClient();
    const modelsToTry = [this.primaryModel, ...this.fallbackModels];
    let lastError: any = null;

    for (const model of modelsToTry) {
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          console.log(`[AIService] Attempting generation with model: ${model}${retries > 0 ? ` (Retry ${retries})` : ''}`);
          
          const config: any = {
            temperature: params.responseMimeType === 'application/json' ? 0.2 : 0.7,
            systemInstruction: params.systemInstruction,
          };
          if (params.responseMimeType) {
            config.responseMimeType = params.responseMimeType;
          }
          if (params.responseSchema) {
            config.responseSchema = params.responseSchema;
          }

          const response = await client.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: params.contents }] }],
            config,
          });

          const text = response.text;
          if (text && text.trim().length > 0) {
            console.log(`[AIService] Success with model: ${model} (${text.length} chars)`);
            return { text, modelUsed: model };
          }
        } catch (err: any) {
          const errorMsg = err?.message || String(err);
          const isQuotaExceeded = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
          
          if (isQuotaExceeded && errorMsg.includes('quota limit: 0')) {
            console.warn(`[AIService] Hard quota limit 0 for ${model}. Skipping to next fallback.`);
            lastError = err;
            break; 
          }

          if (isQuotaExceeded && retries < maxRetries) {
            retries++;
            const delay = Math.pow(2, retries) * 1000;
            console.warn(`[AIService] Rate limited for ${model}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; 
          }

          console.warn(`[AIService] Model ${model} failed:`, errorMsg);
          lastError = err;
          break; 
        }
      }
    }

    throw new Error(`AIService: All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Dynamic Career Analysis - Entry point for the AI Agent
   */
  public async analyzeCareer(role: string, context: string): Promise<string> {
    const systemInstruction = `You are the ASCEND Career Architect. 
    Perform a deep dynamic analysis of the career: "${role}".
    Context provided: ${context}
    Identify core domains, required skill levels, and production engineering requirements.`;

    const { text } = await this.callGeminiWithFallback({
      contents: `Perform dynamic career analysis for: ${role}`,
      systemInstruction,
    });

    return text;
  }
}

export const aiService = AIService.getInstance();
