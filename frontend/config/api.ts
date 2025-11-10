const isDevelopment = process.env.NODE_ENV === 'development';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isDevelopment
    ? "http://127.0.0.1:5001/cws-desc-generator/europe-west3"
    : "https://europe-west3-cws-desc-generator.cloudfunctions.net");

export const API_ENDPOINTS = {
  analyzeText: `${API_BASE_URL}/analyze_text`,
  checkSpamRisk: `${API_BASE_URL}/check_spam_risk`,
  saveAnalysis: `${API_BASE_URL}/save_analysis`,
  getAnalysis: `${API_BASE_URL}/get_analysis`,
};
