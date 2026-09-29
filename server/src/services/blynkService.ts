import axios from 'axios';
import { SensorReading } from '../models/SensorReading';
import { Device } from '../models/Device';
import { ExposureEvent } from '../models/ExposureEvent';
import { User } from '../models/User';

export const fetchBlynkData = async () => {
  const BLYNK_TOKEN = process.env.BLYNK_AUTH_TOKEN;
  const BLYNK_URL = process.env.BLYNK_URL || 'https://blynk.cloud/external/api';

  if (!BLYNK_TOKEN) {
    throw new Error('BLYNK_AUTH_TOKEN is missing in environment variables');
  }

  try {
    // Check if hardware is actually online
    const statusRes = await axios.get(`${BLYNK_URL}/isHardwareConnected?token=${BLYNK_TOKEN}`);
    const isOnline = statusRes.data === true;

    // Get active blynk device
    let device = await (Device as any).findOne({ dataSource: 'blynk' });
    let workerId = device ? (device.workerId as any) : null;
    const deviceId = device ? device.deviceId : 'ESP8266-BLYNK-1';

    if (!isOnline) {
      if (device && device.status !== 'OFFLINE') {
        device.status = 'OFFLINE';
        await device.save();
      }
      throw new Error('Hardware is disconnected from Blynk (Stale Data Ignored).');
    } else if (device && device.status !== 'ONLINE') {
      device.status = 'ONLINE';
      await device.save();
    }

    // Fetch multiple pins: V0 (Humidity), V1 (Temperature), V2 (Gas/H2S)
    const [humRes, tempRes, gasRes] = await Promise.all([
      axios.get(`${BLYNK_URL}/get?token=${BLYNK_TOKEN}&v0`),
      axios.get(`${BLYNK_URL}/get?token=${BLYNK_TOKEN}&v1`),
      axios.get(`${BLYNK_URL}/get?token=${BLYNK_TOKEN}&v2`)
    ]);

    const humidity = parseFloat(humRes.data);
    const temperature = parseFloat(tempRes.data);
    const h2s = parseFloat(gasRes.data); // Mapped 0-80 from MQ-2

    // Validate
    if (isNaN(humidity) || isNaN(temperature) || isNaN(h2s)) {
      throw new Error('Invalid numeric data received from Blynk');
    }

    const timestamp = new Date();

    if (!workerId) {
      const defaultWorker = await (User as any).findOne({ role: 'WORKER' });
      workerId = defaultWorker ? defaultWorker._id : null;
      
      // Auto-create a blynk device in DB if it doesn't exist so we have a persistent link
      if (!device && workerId) {
        device = await (Device as any).create({
          deviceId: 'ESP8266-BLYNK-1',
          workerId: workerId,
          status: 'ONLINE',
          dataSource: 'blynk',
          battery: 100
        });
      }
    }

    if (!workerId) {
      console.warn('No active worker found to assign to Blynk ExposureEvent. Skipping event creation.');
    }

    // Save reading
    const reading = await SensorReading.create({
      deviceId,
      workerId,
      h2s,
      temperature,
      humidity,
      timestamp,
      source: 'blynk'
    });

    // Check if we need to create an exposure event (Hardware threshold is > 50)
    if (h2s > 50 && workerId) {
      // Prevent spam: only create if no event in the last 60 seconds
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const recentEvent = await ExposureEvent.findOne({
        workerId: workerId,
        timestamp: { $gte: oneMinuteAgo }
      });

      if (!recentEvent) {
        await ExposureEvent.create({
          deviceId,
          workerId: workerId as any,
          h2s,
          temperature,
          humidity,
          severity: 'CRITICAL',
          timestamp,
          duration: 1
        });
      }
    }

    if (device) {
      device.lastSeen = timestamp;
      await device.save();
    }

    return reading;
  } catch (error: any) {
    console.error('Error fetching data from Blynk:', error.message);
    throw error;
  }
};
