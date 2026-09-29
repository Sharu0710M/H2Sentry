import { Request, Response } from 'express';
import { User } from '../models/User';
import { Device } from '../models/Device';
import { SensorReading } from '../models/SensorReading';

export const getWorkers = async (req: Request, res: Response) => {
  try {
    const workers = await User.find({ role: 'WORKER' }).select('-password');
    const devices = await Device.find({ workerId: { $in: workers.map(w => w._id) } });
    
    // Get latest reading for each worker's device
    const latestReadings = await SensorReading.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$workerId", h2s: { $first: "$h2s" }, timestamp: { $first: "$timestamp" } } }
    ]);

    const result = workers.map(worker => {
      const device = devices.find(d => d.workerId?.toString() === worker._id.toString());
      const reading = latestReadings.find(r => r._id?.toString() === worker._id.toString());

      return {
        id: worker._id,
        name: worker.name,
        employeeId: worker.employeeId,
        department: worker.department || 'General',
        email: worker.email,
        phone: worker.phone,
        shift: 'MORNING', // Assuming shift logic is dynamic or assigned
        device: device ? {
          deviceId: device.deviceId,
          status: device.status,
          dataSource: device.dataSource
        } : null,
        currentH2s: reading ? reading.h2s : null,
        lastUpdated: reading ? reading.timestamp : (device ? device.lastSeen : worker.updatedAt)
      };
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkerById = async (req: Request, res: Response) => {
  try {
    const worker = await User.findById(req.params.id).select('-password');
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    const device = await Device.findOne({ workerId: worker._id });

    res.json({
      id: worker._id,
      name: worker.name,
      employeeId: worker.employeeId,
      department: worker.department,
      email: worker.email,
      phone: worker.phone,
      createdAt: worker.createdAt,
      device: device ? {
        deviceId: device.deviceId,
        status: device.status,
        battery: device.battery,
        dataSource: device.dataSource,
        lastSeen: device.lastSeen
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
