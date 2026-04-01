import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
import express, { type Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import feedbackRoutes from './routes/feedback.route.js'; 
import analyticsRoutes from './routes/analytics.route.js';



const app: Application = express();
const PORT = process.env.PORT || 4000;

//Middleware
app.use(cors()); 
app.use(express.json()); 

//Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);

//Database Connection & Server Start
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/feedpulse";

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file");
  process.exit(1);
}

if (process.env.NODE_ENV !== 'test'){
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
}

  export default app;