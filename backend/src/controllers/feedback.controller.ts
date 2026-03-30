import { type Request, type Response } from 'express';
import Feedback from '../models/Feedback.js'; 
import { analyzeFeedback } from '../services/gemini.service.js';

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { title, description, category, userName, userEmail } = req.body;

    
    const ai = await analyzeFeedback(title, description);

    const feedback = new Feedback({ 
      title, 
      description, 
      category, 
      userName, 
      userEmail,
      ai_sentiment: ai?.sentiment || "Neutral",
      ai_priority_score: ai?.priority_score || 0,
      ai_summary: ai?.summary || "Summary pending...",
      ai_tags: ai?.tags || []
    });

    await feedback.save();

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

    const result = stats[0].basicStats[0] || { total: 0, avgPriority: 0, openItems: 0 };
    const topTag = stats[0].commonTags[0]?._id || "None";

    res.json({
      total: result.total,
      open: result.openItems,
      avgPriority: result.avgPriority?.toFixed(1) || 0,
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

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedFeedback) return res.status(404).json({ error: "Feedback not found" });
    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};