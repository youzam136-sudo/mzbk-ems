type RuntimeConfig = {
  API_BASE_URL?: string;
};

declare global {
  interface Window {
    __MZBK_RUNTIME_CONFIG__?: RuntimeConfig;
  }
}

function normalizeApiBaseUrl(value: string | undefined) {
  const apiBaseUrl = value?.trim();

  if (!apiBaseUrl) {
    return '/api';
  }

  return apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
}

export const API_BASE_URL = normalizeApiBaseUrl(
  typeof window === 'undefined' ? import.meta.env.VITE_API_BASE_URL : window.__MZBK_RUNTIME_CONFIG__?.API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL
);
