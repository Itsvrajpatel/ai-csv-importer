import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import { CRMLead, CRMLeadArraySchema } from "../validators/crmLead.validator";
import { logger } from "../utils/logger";

export class GeminiService {
  private static _ai: GoogleGenAI | null = null;

  private static get ai(): GoogleGenAI {
    if (!this._ai) {
      if (!env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }

      this._ai = new GoogleGenAI({
        apiKey: env.GEMINI_API_KEY,
      });
    }

    return this._ai;
  }

  public static async extractCRMData(
    systemInstruction: string,
    userPrompt: string
  ): Promise<CRMLead[]> {
    try {
      logger.info("Sending prompt to Gemini...");

      const timeoutMs = 120000;

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Gemini API Timeout: Request took longer than ${timeoutMs / 1000
              } seconds.`
            )
          );
        }, timeoutMs);
      });

      const responsePromise = this.ai.models.generateContent({
        model: env.GEMINI_MODEL,

        contents: userPrompt,

        config: {
          systemInstruction,

          responseMimeType: "application/json",

          temperature: 0,

          topP: 0.95,

          maxOutputTokens: 8192,
        },
      });

      const response = await Promise.race([
        responsePromise,
        timeoutPromise,
      ]);

      const responseText = response.text;

      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response received from Gemini.");
      }

      let parsedJson: unknown;

      try {
        let cleanText = responseText.trim();
        // Remove markdown formatting if Gemini wrapped the response
        cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        
        parsedJson = JSON.parse(cleanText);
      } catch (err) {
        logger.error(
          {
            response: responseText,
          },
          "Gemini returned invalid JSON."
        );

        throw new Error(
          "Invalid JSON: Gemini returned malformed JSON."
        );
      }

      const validation = CRMLeadArraySchema.safeParse(parsedJson);

      if (!validation.success) {
        logger.error(
          {
            errors: validation.error.format(),
          },
          "Gemini response failed Zod validation."
        );

        throw new Error(
          `Schema Validation Error: ${validation.error.message}`
        );
      }

      logger.info(
        `Successfully extracted ${validation.data.length} CRM records.`
      );

      return validation.data;
    } catch (error: any) {
      const message = error?.message ?? "Unknown Gemini error.";

      logger.error(
        {
          error: message,
        },
        "Gemini extraction failed."
      );

      if (
        message.includes("429") ||
        message.toLowerCase().includes("quota") ||
        message.toLowerCase().includes("rate limit")
      ) {
        throw new Error(
          "Rate Limit Exceeded: Gemini API is currently rate limited. Please try again later."
        );
      }

      if (
        message.includes("503") ||
        message.toLowerCase().includes("unavailable")
      ) {
        throw new Error(
          "Gemini service is temporarily unavailable."
        );
      }

      if (
        message.includes("404") &&
        message.toLowerCase().includes("model")
      ) {
        throw new Error(
          `Gemini model "${env.GEMINI_MODEL}" is unavailable.`
        );
      }

      if (message.includes("Timeout")) {
        throw error;
      }

      if (
        message.includes("Schema Validation") ||
        message.includes("Invalid JSON") ||
        message.includes("Empty response")
      ) {
        throw error;
      }

      throw new Error(`Gemini API Failure: ${message}`);
    }
  }
}