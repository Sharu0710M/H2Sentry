import type { SensorData } from '../types';

/**
 * Placeholder for future Blynk IoT integration.
 * In PHASE 1, this is not actively connected.
 * Architecture supports switching to this via environment variable (e.g. VITE_DATA_PROVIDER=blynk)
 */
export const fetchBlynkData = async (): Promise<SensorData> => {
  throw new Error('Blynk integration not implemented in PHASE 1');
};
