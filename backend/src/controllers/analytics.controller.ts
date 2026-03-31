import type{ Request, Response } from 'express';
import { generateWeeklySummary } from '../services/analytics.service.js';

export const getWeeklyReport = async (req: Request, res: Response) => {
  try {
    const summary = await generateWeeklySummary();
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not generate report" });
  }
};