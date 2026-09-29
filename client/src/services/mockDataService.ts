import type { SensorData, H2SStatus, Worker } from '../types';

const generateMockSensorData = (): SensorData => {
  const h2s = Math.random() * 20; // 0 to 20 ppm
  let status: H2SStatus = 'NORMAL';
  if (h2s > 15) status = 'CRITICAL';
  else if (h2s > 10) status = 'ELEVATED';
  else if (h2s > 5) status = 'CAUTION';

  return {
    id: `sensor-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    h2sLevelPpm: parseFloat(h2s.toFixed(2)),
    temperatureC: parseFloat((20 + Math.random() * 15).toFixed(1)), // 20 to 35 C
    humidityPercent: parseFloat((30 + Math.random() * 40).toFixed(1)), // 30% to 70%
    status,
  };
};

export const fetchMockData = async (): Promise<SensorData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockSensorData());
    }, 500);
  });
};

export const fetchMockWorkers = async (): Promise<Worker[]> => {
  return [
    { id: 'W001', name: 'Rahul Sharma', role: 'Field Operator', status: 'ACTIVE', currentExposurePpm: 2.1, dailyAvgExposurePpm: 1.5 },
    { id: 'W002', name: 'Amit Kumar', role: 'Maintenance', status: 'ACTIVE', currentExposurePpm: 0.5, dailyAvgExposurePpm: 0.8 },
    { id: 'W003', name: 'Priya Singh', role: 'Supervisor', status: 'OFF_DUTY', currentExposurePpm: 0, dailyAvgExposurePpm: 0.2 },
  ];
};
