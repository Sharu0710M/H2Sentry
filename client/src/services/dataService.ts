import axios from 'axios';
import type { DashboardData } from '../types';

const API_URL = 'http://localhost:5000/api/sensors';

const getHeaders = () => {
  const token = localStorage.getItem('h2s_token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const { data } = await axios.get(`${API_URL}/dashboard`, getHeaders());
  return data;
};

export const simulateExposureEvent = async (): Promise<void> => {
  await axios.post(`${API_URL}/simulate`, {}, getHeaders());
};

export const captureSnapshot = async (streamIp: string): Promise<any> => {
  const { data } = await axios.post(`${API_URL}/capture`, { streamIp }, getHeaders());
  return data;
};

export const getMonitoringData = async (timeRange: string = '24h'): Promise<any> => {
  const { data } = await axios.get(`${API_URL}/monitoring?timeRange=${timeRange}`, getHeaders());
  return data;
};

export const getImageHistory = async (workerId?: string): Promise<any[]> => {
  const url = workerId ? `${API_URL}/images?workerId=${workerId}` : `${API_URL}/images`;
  const { data } = await axios.get(url, getHeaders());
  return data;
};

export const getAnalyticsData = async (timeRange: 'daily' | 'weekly' | 'monthly', workerId?: string): Promise<any> => {
  const url = workerId ? `http://localhost:5000/api/analytics/${timeRange}?workerId=${workerId}` : `http://localhost:5000/api/analytics/${timeRange}`;
  const { data } = await axios.get(url, getHeaders());
  return data;
};

export const getPredictionData = async (workerId?: string): Promise<any> => {
  const url = workerId ? `http://localhost:5000/api/predictions/shift-analysis?workerId=${workerId}` : `http://localhost:5000/api/predictions/shift-analysis`;
  const { data } = await axios.get(url, getHeaders());
  return data;
};

export const getWorkers = async (): Promise<any[]> => {
  const { data } = await axios.get(`http://localhost:5000/api/workers`, getHeaders());
  return data;
};

export const getWorkerById = async (id: string): Promise<any> => {
  const { data } = await axios.get(`http://localhost:5000/api/workers/${id}`, getHeaders());
  return data;
};

export const getNotifications = async (): Promise<any[]> => {
  const { data } = await axios.get(`http://localhost:5000/api/notifications`, getHeaders());
  return data;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, getHeaders());
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await axios.patch(`http://localhost:5000/api/notifications/read-all`, {}, getHeaders());
};
