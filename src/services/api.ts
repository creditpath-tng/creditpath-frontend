const BASE_URL = "REPLIT_URL_PLACEHOLDER";
const CONSUMER_TOKEN = "demo-token-creditpath-2026";
const ADMIN_TOKEN = "admin-token-creditpath-2026";

const headers = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const scoreUser = async (persona: string) => {
  // Stub — will connect to real endpoint in L7
  console.log(`[stub] scoreUser called for ${persona}`, BASE_URL);
  return { score: 620, band: "Fair", persona };
};

export const explainDecision = async (payload: object) => {
  console.log("[stub] explainDecision called", payload);
  return { explanation: "Stub explanation data" };
};

export const getProgress = async (persona: string) => {
  console.log(`[stub] getProgress called for ${persona}`);
  return { tasks: [], completedCount: 0 };
};

export const getAuditLog = async () => {
  console.log("[stub] getAuditLog called");
  return { entries: [] };
};

export const getAdminConfig = async () => {
  console.log("[stub] getAdminConfig called");
  return { config: {} };
};

export const simulateConfig = async (payload: object) => {
  console.log("[stub] simulateConfig called", payload);
  return { result: "ok" };
};

// suppress unused variable warnings
void headers;
void CONSUMER_TOKEN;
void ADMIN_TOKEN;
