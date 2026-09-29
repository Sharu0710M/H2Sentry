import express from 'express';
import { getPredictionData } from '../controllers/predictionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/shift-analysis', protect, getPredictionData);

export default router;
