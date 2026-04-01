import { Router } from 'express';
import { submitFeedback, getAllFeedback, updateFeedbackStatus,getFeedbackStats, retriggerAI } from '../controllers/feedback.controller.js';
import { login } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { feedbackRateLimiter } from '../middleware/rateLimiter.middleware.js';



const router = Router();


router.post('/', submitFeedback);

router.post('/login', login);
router.get('/stats', protect, getFeedbackStats);
router.get('/', protect, getAllFeedback);
router.patch('/:id/status', protect, updateFeedbackStatus);
router.patch('/:id/retrigger',protect, retriggerAI);

router.post('/', feedbackRateLimiter, submitFeedback);


export default router;