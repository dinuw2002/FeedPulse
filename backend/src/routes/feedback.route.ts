import { Router } from 'express';
import { submitFeedback, getAllFeedback } from '../controllers/feedback.controller.js';

const router = Router();


router.post('/', submitFeedback);


router.get('/', getAllFeedback);

export default router;