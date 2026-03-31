import { type Request, type Response } from 'express';
import Feedback from '../models/Feedback.js'; 
import { analyzeFeedback } from '../services/gemini.service.js';


export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { title, description, category, userName, userEmail } = req.body;

    //Attempt AI analysis, but handle failure gracefully
    let ai;
    try {
      ai = await analyzeFeedback(title, description);
    } catch (aiError) {
      console.warn("AI Analysis failed during submission, using fallbacks:", aiError);
      
    }

    //Create the document (Safe clamping for priority_score to avoid Mongoose errors)
    const feedback = new Feedback({ 
      title, 
      description, 
      category, 
      userName, 
      userEmail,
      ai_sentiment: ai?.sentiment || "Neutral",
      ai_priority_score: Math.max(1, ai?.priority_score || 5),
      ai_summary: ai?.summary || "AI Analysis pending...",
      ai_tags: ai?.tags || ["General"]
    });

    await feedback.save();

    res.status(201).json({ 
      message: "Feedback submitted successfully", 
      data: feedback 
    });
  } catch (error: any) {
    console.error("Submission Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
};


export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      status, 
      search, 
      sortBy = 'createdAt', 
      order = 'desc', 
      page = 1, 
      limit = 10 
    } = req.query;

    const filter: any = {};
    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ai_summary: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [String(sortBy)]: sortOrder };
    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      Feedback.find(filter).sort(sortOptions).skip(skip).limit(Number(limit)),
      Feedback.countDocuments(filter)
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
};


export const getFeedbackStats = async (req: Request, res: Response) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $facet: {
          basicStats: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                avgPriority: { $avg: "$ai_priority_score" },
                openItems: { 
                  $sum: { $cond: [{ $ne: ["$status", "Resolved"] }, 1, 0] } 
                }
              }
            }
          ],
          commonTags: [
            { $unwind: "$ai_tags" },
            { $group: { _id: "$ai_tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
          ]
        }
      }
    ]);

    const result = stats[0]?.basicStats[0] || { total: 0, avgPriority: 0, openItems: 0 };
    const topTag = stats[0]?.commonTags[0]?._id || "None";

    res.json({
      total: result.total,
      open: result.openItems,
      avgPriority: Number(result.avgPriority || 0).toFixed(1),
      topTag: topTag
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};


export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedFeedback) return res.status(404).json({ error: "Feedback not found" });
    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};


export const retriggerAI = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);
    
    if (!feedback) return res.status(404).json({ error: "Feedback not found" });

    //Re-run analysis
    const freshAI = await analyzeFeedback(feedback.title, feedback.description);

    const updated = await Feedback.findByIdAndUpdate(
      id,
      {
        ai_sentiment: freshAI.sentiment,
        ai_priority_score: Math.max(1, freshAI.priority_score),
        ai_summary: freshAI.summary,
        ai_tags: freshAI.tags
      },
      { new: true }
    );

    res.json({ message: "Analysis updated", data: updated });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to re-trigger AI: " + error.message });
  }
};