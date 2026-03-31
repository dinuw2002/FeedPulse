import Feedback from '../models/Feedback.js';
import {askGemini} from './gemini.service.js'; 

export const generateWeeklySummary = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  //Fetch recent feedback
  const recentFeedback = await Feedback.find({
    createdAt: { $gte: sevenDaysAgo }
  }).select('title description ai_sentiment');

  if (recentFeedback.length === 0) {
    return "No feedback collected in the last 7 days to analyze.";
  }

  //Prepare data for Gemini
  const feedbackBlob = recentFeedback
    .map(f => `[${f.ai_sentiment}] ${f.title}: ${f.description}`)
    .join('\n---\n');

  //Request a "Theme Analysis" from Gemini
  const prompt = `
    Based on the following feedback from the last 7 days, identify the Top 3 Recurring Themes.
    For each theme, provide:
    1. A catchy Title
    2. A brief explanation of why it's a theme
    3. Sentiment trend (e.g., 'Increasingly Negative' or 'Mostly Positive')

    Feedback Data:
    ${feedbackBlob}
  `;

  //FIX: Use askGemini to get the result and RETURN it
  try {
    const summary = await askGemini(prompt);
    return summary;
  } catch (error) {
    console.error("Weekly Summary AI Error:", error);
    return "The AI was unable to generate a summary at this time. Please try again later.";
  }
};