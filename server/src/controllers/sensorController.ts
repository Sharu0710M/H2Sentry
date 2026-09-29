import { Request, Response } from 'express';
import { Device } from '../models/Device';
import { SensorReading } from '../models/SensorReading';
import { ExposureEvent } from '../models/ExposureEvent';
import { simulateExposureEvent } from '../services/mockDataService';
import { User } from '../models/User';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const provider = process.env.DATA_PROVIDER || 'mock';
    const activeDevices = await (Device as any).countDocuments({ status: 'ONLINE', dataSource: provider });
    
    // Count workers assigned to online devices
    const onlineDevices = await (Device as any).find({ status: 'ONLINE', dataSource: provider }).select('workerId');
    const activeWorkerIds = [...new Set(onlineDevices.map((d: any) => d.workerId?.toString()).filter(Boolean))];
    const activeWorkers = activeWorkerIds.length;

    // Latest overall reading
    const latestReading = await SensorReading.findOne().sort({ timestamp: -1 });

    // Today's events
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todaysEventsCount = await ExposureEvent.countDocuments({ timestamp: { $gte: startOfDay } });

    // 2. Trend Chart (last 24 hours, average per hour)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const rawTrend = await SensorReading.aggregate([
      { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
      { 
        $group: {
          _id: { 
            year: { $year: "$timestamp" }, month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }, hour: { $hour: "$timestamp" }
          },
          avgH2S: { $avg: "$h2s" },
          date: { $first: "$timestamp" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } }
    ]);

    const trend = rawTrend.map(t => ({
      time: new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      h2s: parseFloat(t.avgH2S.toFixed(2))
    }));

    // 3. Recent Events
    const recentEvents = await ExposureEvent.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('workerId', 'name employeeId')
      .lean();

    res.json({
      metrics: {
        currentH2S: latestReading ? latestReading.h2s : 0,
        temperature: latestReading ? latestReading.temperature : 0,
        humidity: latestReading ? latestReading.humidity : 0,
        activeDevices,
        activeWorkers,
        todaysEvents: todaysEventsCount,
      },
      trend,
      recentEvents: recentEvents.map(e => ({
        id: e._id,
        workerName: (e.workerId as any)?.name || 'Unknown',
        h2s: e.h2s,
        severity: e.severity,
        time: e.timestamp,
        duration: e.duration
      })),
      dataSource: latestReading?.source || 'mock'
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

import { fetchBlynkData } from '../services/blynkService';

export const getLatestSensorData = async (req: Request, res: Response) => {
  try {
    const provider = process.env.DATA_PROVIDER || 'mock';
    let reading = null;
    let blynkError = false;

    if (provider === 'blynk') {
      try {
        reading = await fetchBlynkData();
      } catch (err) {
        console.error('Blynk fetch failed, falling back to latest DB record');
        blynkError = true;
        reading = await SensorReading.findOne({ source: 'blynk' }).sort({ timestamp: -1 });
      }
    } else {
      reading = await SensorReading.findOne({ source: 'mock' }).sort({ timestamp: -1 });
    }

    res.json({
      reading,
      provider,
      blynkError,
      status: blynkError ? 'OFFLINE' : 'ONLINE'
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const simulateEvent = async (req: Request, res: Response) => {
  try {
    const data = await simulateExposureEvent();
    res.status(200).json({ message: 'Simulation triggered', data });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

import { StripImage } from '../models/StripImage';

export const getMonitoringData = async (req: Request, res: Response) => {
  try {
    const timeRange = req.query.timeRange as string || '24h';
    let hours = 24;
    if (timeRange === '1h') hours = 1;
    else if (timeRange === '6h') hours = 6;
    
    const timeAgo = new Date(Date.now() - hours * 60 * 60 * 1000);

    const latestReading = await SensorReading.findOne().sort({ timestamp: -1 });
    const latestImage = await StripImage.findOne().sort({ capturedAt: -1 });
    const provider = process.env.DATA_PROVIDER || 'mock';
    let activeDevice = await (Device as any).findOne({ dataSource: provider });
    if (!activeDevice) {
      activeDevice = await (Device as any).findOne();
    }

    // Trend Chart
    const rawTrend = await SensorReading.aggregate([
      { $match: { timestamp: { $gte: timeAgo } } },
      { 
        $group: {
          _id: { 
            year: { $year: "$timestamp" }, month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }, hour: { $hour: "$timestamp" },
            ...(hours === 1 ? { minute: { $minute: "$timestamp" } } : {})
          },
          avgH2S: { $avg: "$h2s" },
          date: { $first: "$timestamp" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1, "_id.minute": 1 } }
    ]);

    const trend = rawTrend.map(t => ({
      time: new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      h2s: parseFloat(t.avgH2S.toFixed(2))
    }));

    res.json({
      current: latestReading ? {
        h2s: latestReading.h2s,
        temperature: latestReading.temperature,
        humidity: latestReading.humidity,
        timestamp: latestReading.timestamp
      } : null,
      device: activeDevice ? {
        status: activeDevice.status,
        lastSeen: activeDevice.lastSeen,
        dataSource: activeDevice.dataSource
      } : null,
      latestImage: latestImage ? {
        imageUrl: latestImage.imageUrl,
        classification: latestImage.classification,
        confidence: latestImage.confidence,
        detectedColor: latestImage.detectedColor,
        capturedAt: latestImage.capturedAt
      } : null,
      trend,
      thresholds: {
        caution: 10,
        critical: 15
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getImageHistory = async (req: Request, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.workerId) filter.workerId = req.query.workerId;
    
    const history = await StripImage.find(filter).sort({ capturedAt: -1 }).limit(100);
    res.json(history.map(img => ({
      id: img._id,
      imageUrl: img.imageUrl,
      classification: img.classification,
      confidence: img.confidence,
      detectedColor: img.detectedColor,
      associatedH2s: img.associatedH2s,
      capturedAt: img.capturedAt
    })));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

import axios from 'axios';
export const captureCameraSnapshot = async (req: Request, res: Response) => {
  try {
    const { streamIp } = req.body;
    if (!streamIp) return res.status(400).json({ message: 'streamIp required' });
    const baseUrl = streamIp.startsWith('http') ? streamIp.split(':81')[0] : `http://${streamIp}`;
    const imgRes = await axios.get(`${baseUrl}/capture`, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(imgRes.data, 'binary').toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    // Mock AI analysis for hackathon demo
    const latestReading = await SensorReading.findOne().sort({ timestamp: -1 });
    const h2s = latestReading ? latestReading.h2s : 0;
    
    // Find the worker assigned to this device so the image shows up on their profile
    const device = latestReading ? await Device.findOne({ deviceId: latestReading.deviceId }) : null;

    let classification: 'NORMAL' | 'SLIGHT' | 'MODERATE' | 'HIGH' = 'NORMAL';
    let color = 'White/Grey';
    if (h2s > 50) { classification = 'HIGH'; color = 'Dark Brown/Black'; }
    else if (h2s > 20) { classification = 'MODERATE'; color = 'Light Brown'; }
    else if (h2s > 10) { classification = 'SLIGHT'; color = 'Tan'; }

    const newImage = await StripImage.create({
      deviceId: latestReading ? latestReading.deviceId : 'ESP32-CAM',
      workerId: device ? device.workerId : undefined,
      imageUrl,
      classification,
      confidence: 85 + Math.floor(Math.random() * 10),
      detectedColor: color,
      associatedH2s: h2s
    });
    res.status(201).json(newImage);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
