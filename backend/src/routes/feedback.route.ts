import { Router } from 'express';
import { submitFeedback, getAllFeedback, updateFeedbackStatus } from '../controllers/feedback.controller.js';

const router = Router();


router.post('/', submitFeedback);


router.get('/', getAllFeedback);

router.patch('/:id/status', updateFeedbackStatus);

export default router;