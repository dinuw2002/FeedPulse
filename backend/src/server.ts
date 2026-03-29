import dotenv from 'dotenv';
dotenv.config();
import express, { type Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import feedbackRoutes from './routes/feedback.route.js'; 



const app: Application = express();
const PORT = process.env.PORT || 4000;

// 1. Middleware
app.use(cors()); 
app.use(express.json()); 

// 2. Routes
app.use('/api/feedback', feedbackRoutes);

// 3. Database Connection & Server Start
const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });