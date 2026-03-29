import { type Request, type Response } from 'express';
import Feedback from '../models/Feedback.js'; 
import { analyzeFeedback } from '../services/gemini.service.js';

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { title, description, category, userName, userEmail } = req.body;

    
    const feedback = new Feedback({ 
      title, 
      description, 
      category, 
      userName, 
      userEmail 
    });
    await feedback.save();

    
    const aiAnalysis = await analyzeFeedback(title, description);

    if (aiAnalysis) {
      feedback.ai_sentiment = aiAnalysis.sentiment;
      feedback.ai_priority_score = aiAnalysis.priority_score;
      feedback.ai_summary = aiAnalysis.summary;
      feedback.ai_tags = aiAnalysis.tags;
      await feedback.save();
    }

    res.status(201).json({ 
      message: "Feedback submitted successfully", 
      data: feedback 
    });
  } catch (error) {
    console.error("Submission Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;
    const filter: any = {};
    
    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;

    const data = await Feedback.find(filter).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
};

export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Returns the updated document
    );

    if (!updatedFeedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};