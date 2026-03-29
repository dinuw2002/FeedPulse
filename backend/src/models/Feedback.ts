import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  title: string;
  description: string;
  category: 'Bug' | 'Feature Request' | 'Improvement' | 'Other';
  userName?: string;
  userEmail?: string;
  status: 'New' | 'In Review' | 'Resolved';
  
  ai_sentiment: 'Positive' | 'Negative' | 'Neutral';
  ai_priority_score: number; 
  ai_summary: string;
  ai_tags: string[];
  createdAt: Date;
}

const FeedbackSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Bug', 'Feature Request', 'Improvement', 'Other'], required: true },
  userName: { type: String },
  userEmail: { type: String },
  status: { type: String, enum: ['New', 'In Review', 'Resolved'], default: 'New' },
  ai_sentiment: { type: String, enum: ['Positive', 'Negative', 'Neutral'] },
  ai_priority_score: { type: Number, min: 1, max: 10 },
  ai_summary: { type: String },
  ai_tags: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);