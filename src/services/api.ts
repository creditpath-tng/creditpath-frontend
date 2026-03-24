const BASE_URL = 'https://e37fcc4b-dc6d-4821-85bc-7940a9476e3f-00-bxzh6v4v6i34.picard.replit.dev';

const CONSUMER_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer demo-token-creditpath-2026'
};

const ADMIN_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer admin-token-creditpath-2026'
};

const post = async (url: string, body: object, headers: Record<string, string>) => {
  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
};

const get = async (url: string, headers: Record<string, string>) => {
  const response = await fetch(url, { method: 'GET', headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
};

export const scoreUser = async (persona: string) =>
  post(`${BASE_URL}/score`, { user_id: `${persona}_001`, persona }, CONSUMER_HEADERS);

export const explainDecision = async (payload: {
  decision_id: string;
  tier: number;
  score: number;
  factors: object[];
}) => post(`${BASE_URL}/explain`, payload, CONSUMER_HEADERS);

export const getProgress = async (persona: string) =>
  post(`${BASE_URL}/progress`, { persona }, CONSUMER_HEADERS);

export const getAuditLog = async () =>
  get(`${BASE_URL}/audit-log`, CONSUMER_HEADERS);

export const getAdminConfig = async () =>
  get(`${BASE_URL}/admin/model-config`, ADMIN_HEADERS);

export const simulateConfig = async (payload: {
  segment_weights: object;
  tier_thresholds: object;
  recency_mode: string;
}) => {
  const response = await fetch(
    'https://e37fcc4b-dc6d-4821-85bc-7940a9476e3f-00-bxzh6v4v6i34.picard.replit.dev/admin/simulate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token-creditpath-2026'
      },
      body: JSON.stringify(payload)
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }
  return response.json();
};
