import { SensorReading } from '../models/SensorReading';
import { ExposureEvent } from '../models/ExposureEvent';
import { Device } from '../models/Device';
import { User } from '../models/User';
import { StripImage } from '../models/StripImage';
import { Notification } from '../models/Notification';

export const generateHistoricalData = async () => {
  const workers = await User.find({ role: 'WORKER' });
  if (workers.length === 0) return;

  const devices = await Device.find({ dataSource: 'mock' });
  if (devices.length === 0) return;

  const readings = [];
  const events = [];
  const images = [];
  const now = new Date();
  
  // Seed 30 days of data, 1 reading per hour per device
  for (let i = 30 * 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    for (const device of devices) {
      const isSpike = Math.random() > 0.98;
      const h2s = isSpike ? (Math.random() * 15 + 10) : (Math.random() * 4 + 1);
      const temp = 29.8 + Math.random() * 3.2;
      const humidity = 60 + Math.random() * 15;

      readings.push({
        deviceId: device.deviceId,
        workerId: device.workerId as any,
        h2s: parseFloat(h2s.toFixed(2)),
        temperature: parseFloat(temp.toFixed(1)),
        humidity: parseFloat(humidity.toFixed(1)),
        timestamp,
        source: 'mock'
      });

      if (h2s > 10) {
        events.push({
          deviceId: device.deviceId,
          workerId: device.workerId as any,
          h2s: parseFloat(h2s.toFixed(2)),
          temperature: parseFloat(temp.toFixed(1)),
          humidity: parseFloat(humidity.toFixed(1)),
          severity: h2s > 20 ? 'CRITICAL' : h2s > 15 ? 'ELEVATED' : 'CAUTION',
          timestamp,
          duration: Math.floor(Math.random() * 120 + 30)
        });
      }

      // Generate 1 image every 12 hours
      if (i % 12 === 0) {
        let classification = 'NORMAL';
        let detectedColor = 'White/Off-White';
        if (h2s > 20) { classification = 'HIGH'; detectedColor = 'Dark Brown/Black'; }
        else if (h2s > 15) { classification = 'MODERATE'; detectedColor = 'Brown'; }
        else if (h2s > 10) { classification = 'SLIGHT'; detectedColor = 'Light Brown/Yellow'; }

        images.push({
          deviceId: device.deviceId,
          workerId: device.workerId as any,
          imageUrl: `mock_strip_${classification.toLowerCase()}.png`, // Placeholder URL
          capturedAt: timestamp,
          classification,
          confidence: parseFloat((85 + Math.random() * 14).toFixed(1)), // 85% - 99%
          detectedColor,
          associatedH2s: parseFloat(h2s.toFixed(2))
        });
      }
    }
  }

  await SensorReading.insertMany(readings);
  if (events.length > 0) await ExposureEvent.insertMany(events);
  if (images.length > 0) await StripImage.insertMany(images);
};

export const simulateExposureEvent = async () => {
  const device = await Device.findOne({ status: 'ONLINE', dataSource: 'mock' });
  if (!device) throw new Error('No active mock devices found');

  const h2s = parseFloat((Math.random() * 10 + 20).toFixed(2));
  const temp = parseFloat((29.8 + Math.random() * 3.2).toFixed(1));
  const humidity = parseFloat((60 + Math.random() * 15).toFixed(1));
  const timestamp = new Date();

  const reading = await SensorReading.create({
    deviceId: device.deviceId,
    workerId: device.workerId as any,
    h2s, temperature: temp, humidity, timestamp, source: 'mock'
  });

  const event = await ExposureEvent.create({
    deviceId: device.deviceId,
    workerId: device.workerId as any,
    h2s, temperature: temp, humidity, severity: 'CRITICAL', timestamp, duration: 60
  });

  const image = await StripImage.create({
    deviceId: device.deviceId,
    workerId: device.workerId as any,
    imageUrl: `mock_strip_high.png`,
    capturedAt: timestamp,
    classification: 'HIGH',
    confidence: 97.4,
    detectedColor: 'Dark Brown/Black',
    associatedH2s: h2s
  });

  await Notification.create({
    workerId: device.workerId as any,
    type: 'CRITICAL',
    title: 'Critical H₂S Exposure Detected',
    message: `H₂S level reached ${h2s} ppm on device ${device.deviceId}. Immediate evacuation required.`,
    severity: 'CRITICAL'
  });

  await Notification.create({
    workerId: device.workerId as any,
    type: 'DEVICE',
    title: 'Visual Strip Alert',
    message: `Camera module detected HIGH (Black) strip color classification for device ${device.deviceId}.`,
    severity: 'HIGH'
  });

  return { reading, event, image };
};
