import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';


jest.unstable_mockModule('../services/gemini.service.js', () => ({
  analyzeFeedback: jest.fn(),
  askGemini: jest.fn(), 
}));


const { analyzeFeedback } = await import('../services/gemini.service.js');
const { default: app } = await import('../server.js');
const { default: Feedback } = await import('../models/Feedback.js');


const mockAnalyzeFeedback = analyzeFeedback as jest.MockedFunction<typeof analyzeFeedback>;

describe('FeedPulse Backend Integration Tests', () => {
  
  beforeAll(async () => {
    // Connect to a dedicated test database to keep your dev data clean
    if (mongoose.connection.readyState === 0) {
      const testDbUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/feedpulse_test';
      await mongoose.connect(testDbUri).catch(() => {
        console.warn("⚠️  Note: Mongoose connection failed. Tests will run in mock mode.");
      });
    }
  });

  afterAll(async () => {
    // Ensure the event loop closes by cleaning up connections and mocks
    await mongoose.connection.close();
    jest.restoreAllMocks();
  });

  describe('POST /api/feedback', () => {
    
    it('should process valid feedback and return AI-enhanced data', async () => {
      // Setup the mock for a successful AI response
      mockAnalyzeFeedback.mockResolvedValue({
        sentiment: 'Positive',
        priority_score: 8,
        summary: 'Excellent feedback received.',
        tags: ['General']
      });

      const payload = {
        title: "High Quality UI",
        description: "The dashboard design is very intuitive.",
        category: "Other", 
        userName: "John Doe",
        userEmail: "john@example.com"
      };

      const res = await request(app).post('/api/feedback').send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.ai_sentiment).toBe('Positive');
      expect(mockAnalyzeFeedback).toHaveBeenCalled();
    });

    it('should handle AI service failures gracefully using Fail-Soft logic', async () => {
      // Simulate an AI outage
      mockAnalyzeFeedback.mockRejectedValue(new Error("Gemini API Offline"));
      
      const payload = { 
        title: "API Resilience Test", 
        description: "Testing fallback mechanism", 
        category: "Other" 
      };

      const res = await request(app).post('/api/feedback').send(payload);

      // Status should still be 201 because the database save succeeded
      expect(res.statusCode).toBe(201);
      expect(res.body.data.ai_sentiment).toBe('Neutral'); 
    });

    it('should reject requests with missing mandatory fields', async () => {
      const res = await request(app).post('/api/feedback').send({ description: "Missing title" });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Admin Operations & Security', () => {
    
    it('should allow status updates via PATCH', async () => {
      // Create a temporary document
      const tempDoc = new Feedback({
        title: "Status Patch Test",
        description: "Integration testing",
        category: "Other",
        ai_priority_score: 1
      });
      
      const saved = await tempDoc.save().catch(() => ({ _id: new mongoose.Types.ObjectId() }));

      const res = await request(app)
        .patch(`/api/feedback/${saved._id}`)
        .send({ status: "Resolved" });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("Resolved");
    });

    it('should block unauthorized access to protected routes', async () => {
      const res = await request(app).get('/api/analytics/weekly-report');
      
      // Verifies the Auth Middleware is active
      expect(res.statusCode).toBe(401);
    });
  });
});