import dotenv from 'dotenv';
dotenv.config();


interface AIAnalysis {
  sentiment: "Positive" | "Negative" | "Neutral";
  priority_score: number;
  summary: string;
  tags: string[];
}

const API_BASE = "https://generativelanguage.googleapis.com";

export const analyzeFeedback = async (title: string, description: string): Promise<AIAnalysis> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

  
  const URL_25 = `${API_BASE}/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{
        text: `Analyze this feedback. Return ONLY a raw JSON object.
               Title: "${title}"
               Description: "${description}"
               
               Schema:
               {
                 "sentiment": "Positive" | "Negative" | "Neutral",
                 "priority_score": number (1-10),
                 "summary": "1-sentence summary",
                 "tags": ["tag1", "tag2"]
               }`
      }]
    }]
  };

  try {
    const response = await fetch(URL_25, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return parseAndSanitizeAIResponse(data);
  } catch (error: any) {
    console.error("AI Service Error:", error.message);
    
    throw error;
  }
};

export const askGemini = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  const URL = `${API_BASE}/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Gemini API Error");
  
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available.";
};

function parseAndSanitizeAIResponse(data: any): AIAnalysis {
  try {
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("No JSON found");
    
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      sentiment: ["Positive", "Negative", "Neutral"].includes(parsed.sentiment) 
                 ? parsed.sentiment 
                 : "Neutral",
      priority_score: Math.max(1, Math.min(10, Number(parsed.priority_score) || 5)),
      summary: parsed.summary?.substring(0, 150) || "Summary not available.",
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : ["General"]
    };
  } catch (err) {
    return {
      sentiment: "Neutral",
      priority_score: 5,
      summary: "AI analysis encountered an error.",
      tags: ["Fallback"]
    };
  }

}