import { Router } from 'express';
import { getWeeklyReport } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';


const router = Router();

router.get('/weekly-report',protect, getWeeklyReport);

export default router;