const isDevelopment = process.env.NODE_ENV === 'development';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isDevelopment
    ? "http://127.0.0.1:5001/cws-desc-generator/europe-west3"
    : "https://europe-west3-cws-desc-generator.cloudfunctions.net");

export const API_ENDPOINTS = {
  generateDescription: `${API_BASE_URL}/generate_description`,
};

