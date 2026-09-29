import express from 'express';
import { getWorkers, getWorkerById } from '../controllers/workerController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Only ADMIN and SAFETY_OFFICER can access workers
router.get('/', protect, authorize('ADMIN', 'SAFETY_OFFICER'), getWorkers);
router.get('/:id', protect, authorize('ADMIN', 'SAFETY_OFFICER'), getWorkerById);

export default router;
