import { Request, Response } from 'express';
import { SensorReading } from '../models/SensorReading';
import { ExposureEvent } from '../models/ExposureEvent';
import { StripImage } from '../models/StripImage';
import mongoose from 'mongoose';

const getAnalytics = async (req: Request, res: Response, groupBy: any, match: any) => {
  try {
    const readings = await SensorReading.aggregate([
      { $match: match },
      { 
        $group: {
          _id: groupBy,
          avgH2s: { $avg: '$h2s' },
          peakH2s: { $max: '$h2s' },
          minH2s: { $min: '$h2s' },
          avgTemp: { $avg: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          date: { $first: '$timestamp' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    const events = await ExposureEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupBy,
          totalEvents: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          date: { $first: '$timestamp' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    const stripChanges = await StripImage.countDocuments({
      ...match,
      classification: { $in: ['SLIGHT', 'MODERATE', 'HIGH'] }
    });

    const totalStats = await SensorReading.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          avgH2s: { $avg: '$h2s' },
          peakH2s: { $max: '$h2s' },
          minH2s: { $min: '$h2s' },
          avgTemp: { $avg: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalEventsResult = await ExposureEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);

    const stats = totalStats[0] || { avgH2s: 0, peakH2s: 0, minH2s: 0, avgTemp: 0, avgHumidity: 0, count: 0 };
    const eventStats = totalEventsResult[0] || { totalEvents: 0, totalDuration: 0 };

    res.json({
      metrics: {
        averageH2s: parseFloat(stats.avgH2s.toFixed(2)),
        peakH2s: parseFloat(stats.peakH2s.toFixed(2)),
        minH2s: parseFloat(stats.minH2s.toFixed(2)),
        exposureEvents: eventStats.totalEvents,
        totalMonitoringDuration: stats.count, // assuming 1 reading = 1 hour based on seed
        totalExposureDuration: eventStats.totalDuration,
        stripChanges: stripChanges,
        averageTemperature: parseFloat(stats.avgTemp.toFixed(1)),
        averageHumidity: parseFloat(stats.avgHumidity.toFixed(1))
      },
      chartData: readings.map((r, i) => {
        const ev = events.find(e => JSON.stringify(e._id) === JSON.stringify(r._id));
        return {
          time: r.date, // Will be formatted by frontend
          h2s: parseFloat(r.avgH2s.toFixed(2)),
          temperature: parseFloat(r.avgTemp.toFixed(1)),
          humidity: parseFloat(r.avgHumidity.toFixed(1)),
          events: ev ? ev.totalEvents : 0
        };
      })
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyAnalytics = async (req: Request, res: Response) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const match: any = { timestamp: { $gte: startOfDay } };
  if (req.query.workerId) match.workerId = new mongoose.Types.ObjectId(req.query.workerId as string);

  await getAnalytics(
    req, res,
    { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' }, hour: { $hour: '$timestamp' } },
    match
  );
};

export const getWeeklyAnalytics = async (req: Request, res: Response) => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);
  const match: any = { timestamp: { $gte: startOfWeek } };
  if (req.query.workerId) match.workerId = new mongoose.Types.ObjectId(req.query.workerId as string);

  await getAnalytics(
    req, res,
    { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' } },
    match
  );
};

export const getMonthlyAnalytics = async (req: Request, res: Response) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(startOfMonth.getDate() - 30);
  startOfMonth.setHours(0, 0, 0, 0);
  const match: any = { timestamp: { $gte: startOfMonth } };
  if (req.query.workerId) match.workerId = new mongoose.Types.ObjectId(req.query.workerId as string);
  
  await getAnalytics(
    req, res,
    { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' } },
    match
  );
};
