import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const analyzeFeedback = async (title: string, description: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze the following product feedback:
    Title: "${title}"
    Description: "${description}"

    Return ONLY a valid JSON object with the following keys:
    "sentiment": (string: "Positive", "Negative", or "Neutral"),
    "priority_score": (number: 1 to 10 based on urgency),
    "summary": (string: a concise 1-sentence summary),
    "tags": (array of strings: relevant categories like "UI", "Performance", etc.)
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return null;
  }
};