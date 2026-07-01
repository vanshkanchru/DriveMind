import axios from "axios";

const API_BASE_URL = "http://localhost:5001";

export const getHealthStatus = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/health`);
  return response.data;
};

export const getAllExperiences = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/experiences`);
  return response.data;
};

export const getRoadRisk = async (roadSegmentId) => {
  const response = await axios.get(`${API_BASE_URL}/api/road-risk/${roadSegmentId}`);
  return response.data;
};

export const sendTelemetry = async (telemetryData) => {
  const response = await axios.post(`${API_BASE_URL}/api/telemetry`, telemetryData);
  return response.data;
};