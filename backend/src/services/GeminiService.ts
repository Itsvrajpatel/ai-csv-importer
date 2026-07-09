import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { CRMLead, CRMLeadArraySchema } from '../validators/crmLead.validator';
import { logger } from '../utils/logger';

export class GeminiService {
  // Initialize the Gemini client only once using the singleton pattern.
  // We use a getter so it only throws if we actually try to use it without a key.
  private static _genAI: GoogleGenerativeAI | null = null;

  private static get genAI(): GoogleGenerativeAI {
    if (!this._genAI) {
      if (!env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is missing.');
      }
      this._genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    return this._genAI;
  }

  /**
   * Extracts CRM data by passing the combined prompts to Gemini 2.5 Flash.
   *
   * @param systemInstruction The rigid schema and rules prompt.
   * @param userPrompt The CSV headers and records to be processed.
   * @returns A promise resolving to an array of validated CRMLead objects.
   */
  public static async extractCRMData(systemInstruction: string, userPrompt: string): Promise<CRMLead[]> {
    try {
      // 1. Initialize the model dynamically so we can inject the systemInstruction for this specific request.
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      logger.info('Sending prompt to Gemini API for CRM data extraction...');

      // Implement a timeout to throw a descriptive error if Gemini hangs (e.g., 60 seconds)
      const timeoutMs = 60000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API Timeout: Request took longer than 60 seconds.')), timeoutMs);
      });

      // 2. Send the prompt to Gemini
      const responsePromise = model.generateContent(userPrompt);

      const result = await Promise.race([responsePromise, timeoutPromise]);
      const response = result.response;
      const responseText = response.text();

      // 3 & 4. Validate empty response and parse JSON safely
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response received from Gemini API.');
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(responseText);
      } catch (parseError) {
        logger.error({ responseText }, 'Failed to parse Gemini response as JSON');
        throw new Error('Invalid JSON: Gemini returned malformed JSON data.');
      }

      // 5. Validate the parsed response using Zod
      const validationResult = CRMLeadArraySchema.safeParse(parsedJson);

      if (!validationResult.success) {
        logger.error({ errors: validationResult.error.format() }, 'Zod validation failed for Gemini output');
        throw new Error(`Schema Validation Error: Gemini output did not match the required CRM schema. Details: ${validationResult.error.message}`);
      }

      logger.info(`Successfully extracted ${validationResult.data.length} CRM leads from Gemini response.`);
      return validationResult.data;

    } catch (error: any) {
      // 6. Throw descriptive errors based on API failure types
      const errorMessage = error.message || 'Unknown error occurred';

      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('rate limit')) {
        throw new Error('Rate Limit Exceeded: Gemini API is currently rate limited. Please try again later.');
      }

      if (errorMessage.includes('Timeout')) {
        throw error; // Already formatted by our Promise.race
      }

      if (errorMessage.includes('Invalid JSON') || errorMessage.includes('Schema Validation Error') || errorMessage.includes('Empty response')) {
        throw error; // Rethrow our custom data integrity errors
      }

      // Catch-all for other generic API failures
      throw new Error(`Gemini API Failure: ${errorMessage}`);
    }
  }
}
