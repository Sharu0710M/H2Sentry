export type H2SStatus = 'NORMAL' | 'CAUTION' | 'ELEVATED' | 'CRITICAL';

export interface SensorData {
  id: string;
  timestamp: string;
  h2sLevelPpm: number;
  temperatureC: number;
  humidityPercent: number;
  status: H2SStatus;
  stripColor?: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'OFF_DUTY';
  currentExposurePpm: number;
  dailyAvgExposurePpm: number;
}

export interface DashboardMetrics {
  currentH2S: number;
  temperature: number;
  humidity: number;
  activeDevices: number;
  activeWorkers: number;
  todaysEvents: number;
}

export interface TrendData {
  time: string;
  h2s: number;
}

export interface ExposureEventData {
  id: string;
  workerName: string;
  h2s: number;
  severity: string;
  time: string;
  duration: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  trend: TrendData[];
  recentEvents: ExposureEventData[];
  dataSource: string;
}

export interface MonitoringData {
  current: {
    h2s: number;
    temperature: number;
    humidity: number;
    timestamp: string;
  } | null;
  device: {
    status: string;
    lastSeen: string;
    dataSource: string;
  } | null;
  latestImage: {
    imageUrl: string;
    classification: string;
    confidence: number;
    detectedColor: string;
    capturedAt: string;
  } | null;
  trend: TrendData[];
  thresholds: {
    caution: number;
    critical: number;
  };
}

export interface StripImageData {
  id: string;
  imageUrl: string;
  classification: string;
  confidence: number;
  detectedColor: string;
  associatedH2s?: number;
  capturedAt: string;
}

export interface AnalyticsMetrics {
  averageH2s: number;
  peakH2s: number;
  minH2s: number;
  exposureEvents: number;
  totalMonitoringDuration: number;
  totalExposureDuration: number;
  stripChanges: number;
  averageTemperature: number;
  averageHumidity: number;
}

export interface AnalyticsChartData {
  time: string;
  h2s: number;
  temperature: number;
  humidity: number;
  events: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  chartData: AnalyticsChartData[];
}

export interface ShiftAnalysis {
  shift: string;
  averageH2s: number;
  peakH2s: number;
  events: number;
  monitoringHours: number;
  indicator: string;
}

export interface PredictionData {
  shifts: ShiftAnalysis[];
  advisory: string;
  highestRiskShift: string;
  trend: {
    historicalAverage: number;
    projectedPattern: string;
  };
}
  
export interface NotificationData {  
  _id: string;  
  type: 'CRITICAL' | 'WARNING' | 'SYSTEM' | 'DEVICE';  
  title: string;  
  message: string;  
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';  
  read: boolean;  
  createdAt: string;  
} 
