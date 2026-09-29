import { Request, Response } from 'express';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const filters: any = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.read !== undefined) filters.read = req.query.read === 'true';

    // In a real system, you might filter by req.user._id, but for now we'll return all for the safety officer
    const notifications = await Notification.find(filters).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
