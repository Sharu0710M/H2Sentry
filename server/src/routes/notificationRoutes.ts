import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, authorize('ADMIN', 'SAFETY_OFFICER'), getNotifications);
router.patch('/read-all', protect, authorize('ADMIN', 'SAFETY_OFFICER'), markAllAsRead);
router.patch('/:id/read', protect, authorize('ADMIN', 'SAFETY_OFFICER'), markAsRead);

export default router;
