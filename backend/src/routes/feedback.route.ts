import { Router } from 'express';
import { submitFeedback, getAllFeedback, updateFeedbackStatus } from '../controllers/feedback.controller.js';
import { login } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { feedbackRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();


router.post('/', submitFeedback);
router.get('/', getAllFeedback);
router.patch('/:id/status', updateFeedbackStatus);


router.post('/login', login);
router.get('/', protect, getAllFeedback);
router.patch('/:id/status', protect, updateFeedbackStatus);

router.post('/', feedbackRateLimiter, submitFeedback);

export default router;