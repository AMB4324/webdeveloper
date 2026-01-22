
import { GoogleGenAI, Type } from "@google/genai";

export const estimateProjectBudget = async (description: string): Promise<number> => {
  try {
    // We create the instance inside the function to ensure we use the most up-to-date injected key.
    // The apiKey is obtained exclusively from the environment variable process.env.API_KEY.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Estimate a fair budget for this web development project based on its description. 
      The budget MUST be between $10 and $100.
      
      Project Description: "${description}"`,
      config: {
        systemInstruction: "You are a professional software project estimator. Your goal is to provide a single numeric value representing the suggested budget in USD. High complexity projects get closer to $100, while simple tasks get closer to $10.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedBudget: {
              type: Type.NUMBER,
              description: "The estimated budget for the project in USD, between 10 and 100."
            },
            reasoning: {
              type: Type.STRING,
              description: "Short explanation for the budget."
            }
          },
          required: ["suggestedBudget"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const result = JSON.parse(text);
    return Math.min(Math.max(result.suggestedBudget || 25, 10), 100);
  } catch (error) {
    // If there's an error (e.g. invalid key, quota, or network), we silently fallback to a default budget.
    console.debug("Gemini estimation failed, using fallback:", error);
    return 25;
  }
};
