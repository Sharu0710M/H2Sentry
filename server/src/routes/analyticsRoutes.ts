import express from 'express';
import { getDailyAnalytics, getWeeklyAnalytics, getMonthlyAnalytics } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/daily', protect, getDailyAnalytics);
router.get('/weekly', protect, getWeeklyAnalytics);
router.get('/monthly', protect, getMonthlyAnalytics);

export default router;
