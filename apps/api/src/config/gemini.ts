import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env.js";

export const gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const GEMINI_MODEL = "gemini-2.0-flash";
export const GEMINI_MAX_TOKENS = 1024;
