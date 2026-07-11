import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.string().default("8000"),

  GEMINI_API_KEY: z.string(),

  GEMINI_MODEL: z.string().default("gemini-flash-latest"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(parsed.error.format());
  throw new Error("Invalid environment variables.");
}

export const env = parsed.data;