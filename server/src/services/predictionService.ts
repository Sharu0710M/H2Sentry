import { SensorReading } from '../models/SensorReading';
import { ExposureEvent } from '../models/ExposureEvent';
import mongoose from 'mongoose';

export const getShiftAnalysis = async (workerId?: string) => {
  // Morning: 06:00 - 14:00
  // Afternoon: 14:00 - 22:00
  // Night: 22:00 - 06:00

  const matchStage = workerId ? { $match: { workerId: new mongoose.Types.ObjectId(workerId) } } : { $match: {} };

  const readings = await SensorReading.aggregate([
    matchStage,
    {
      $project: {
        h2s: 1,
        hour: { $hour: "$timestamp" }
      }
    },
    {
      $addFields: {
        shift: {
          $switch: {
            branches: [
              { case: { $and: [{ $gte: ["$hour", 6] }, { $lt: ["$hour", 14] }] }, then: "MORNING" },
              { case: { $and: [{ $gte: ["$hour", 14] }, { $lt: ["$hour", 22] }] }, then: "AFTERNOON" }
            ],
            default: "NIGHT"
          }
        }
      }
    },
    {
      $group: {
        _id: "$shift",
        avgH2s: { $avg: "$h2s" },
        peakH2s: { $max: "$h2s" },
        count: { $sum: 1 }
      }
    }
  ]);

  const events = await ExposureEvent.aggregate([
    matchStage,
    {
      $project: {
        duration: 1,
        hour: { $hour: "$timestamp" }
      }
    },
    {
      $addFields: {
        shift: {
          $switch: {
            branches: [
              { case: { $and: [{ $gte: ["$hour", 6] }, { $lt: ["$hour", 14] }] }, then: "MORNING" },
              { case: { $and: [{ $gte: ["$hour", 14] }, { $lt: ["$hour", 22] }] }, then: "AFTERNOON" }
            ],
            default: "NIGHT"
          }
        }
      }
    },
    {
      $group: {
        _id: "$shift",
        totalEvents: { $sum: 1 }
      }
    }
  ]);

  const result = ['MORNING', 'AFTERNOON', 'NIGHT'].map(shift => {
    const readingStats = readings.find(r => r._id === shift) || { avgH2s: 0, peakH2s: 0, count: 0 };
    const eventStats = events.find(e => e._id === shift) || { totalEvents: 0 };
    
    let indicator = 'NORMAL';
    if (readingStats.avgH2s > 15) indicator = 'CRITICAL';
    else if (readingStats.avgH2s > 10) indicator = 'ELEVATED';
    else if (readingStats.avgH2s > 5) indicator = 'CAUTION';

    return {
      shift,
      averageH2s: parseFloat(readingStats.avgH2s.toFixed(1)),
      peakH2s: parseFloat(readingStats.peakH2s.toFixed(1)),
      events: eventStats.totalEvents,
      monitoringHours: readingStats.count, // mock approx 1 hr per reading based on seed
      indicator
    };
  });

  return result;
};
