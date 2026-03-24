import axios from 'axios';

const BASE_URL = 'https://e37fcc4b-dc6d-4821-85bc-7940a9476e3f-00-bxzh6v4v6i34.picard.replit.dev';

const CONSUMER_TOKEN = 'demo-token-creditpath-2026';
const ADMIN_TOKEN = 'admin-token-creditpath-2026';

const consumerApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CONSUMER_TOKEN}`
  },
  timeout: 10000
});

const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_TOKEN}`
  },
  timeout: 10000
});

export const scoreUser = async (persona: string) => {
  const response = await consumerApi.post('/score', {
    user_id: `${persona}_001`,
    persona
  });
  return response.data;
};

export const explainDecision = async (payload: {
  decision_id: string;
  tier: number;
  score: number;
  factors: object[];
}) => {
  const response = await consumerApi.post('/explain', payload);
  return response.data;
};

export const getProgress = async (persona: string) => {
  const response = await consumerApi.post('/progress', { persona });
  return response.data;
};

export const getAuditLog = async () => {
  const response = await consumerApi.get('/audit-log');
  return response.data;
};

export const getAdminConfig = async () => {
  const response = await adminApi.get('/admin/model-config');
  return response.data;
};

export const simulateConfig = async (payload: {
  segment_weights: object;
  tier_thresholds: object;
  recency_mode: string;
}) => {
  const response = await adminApi.post('/admin/simulate', payload);
  return response.data;
};
