import express from 'express';
import { getDashboardData, simulateEvent, getMonitoringData, getImageHistory, getLatestSensorData, captureCameraSnapshot } from '../controllers/sensorController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/dashboard', protect, getDashboardData);
router.get('/monitoring', protect, getMonitoringData);
router.get('/latest', protect, getLatestSensorData);
router.get('/images', protect, getImageHistory);
router.post('/simulate', protect, simulateEvent);
router.post('/capture', protect, captureCameraSnapshot);

export default router;
