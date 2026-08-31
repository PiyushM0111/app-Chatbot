// Centralized Production-Grade API Client & Safe JSON Response Parser

const getEnvApiUrl = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
      return process.env.VITE_API_URL;
    }
  } catch (e) {}
  return '';
};

const RAW_API_URL = getEnvApiUrl().trim().replace(/\/+$/, '');

/**
 * Resolves full API endpoint URL in both local development and production deployments.
 * @param {string} endpoint - e.g. '/api/auth/login'
 * @returns {string} Fully resolved URL or relative path
 */
export const getApiUrl = (endpoint) => {
  if (!endpoint) return '';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!RAW_API_URL) return cleanEndpoint;
  return `${RAW_API_URL}${cleanEndpoint}`;
};

/**
 * Safely parses fetch responses, guarding against HTML error pages and SPA rewrites.
 * @param {Response} response - Standard fetch Response object
 * @returns {Promise<any>} Parsed JSON object
 * @throws {Error} Clear, actionable error message if response is non-JSON HTML or server error
 */
export const parseJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  const trimmed = text.trim();

  // If response is HTML document (e.g. from Netlify 404/SPA rewrite or nginx gateway)
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.includes('<title>')) {
    const statusInfo = `${response.status} ${response.statusText || ''}`.trim();
    if (response.status === 404 || response.status === 200) {
      throw new Error(
        `API endpoint not reachable (${statusInfo}). ` +
        `The backend server is either offline or the API route is being intercepted by static hosting. ` +
        `Please ensure the backend server is running and CORS/proxy routes are configured.`
      );
    }
    throw new Error(`The server returned an HTML error page (${statusInfo}). Please check your backend connection.`);
  }

  // If response is not JSON
  if (!contentType.includes('application/json') && !trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    if (!response.ok) {
      throw new Error(trimmed.slice(0, 150) || `Request failed with status ${response.status}`);
    }
    return { success: true, text: trimmed };
  }

  // Parse JSON payload
  try {
    const data = JSON.parse(trimmed || '{}');
    return data;
  } catch (parseErr) {
    throw new Error(`Failed to parse server response: ${parseErr.message}`);
  }
};

/**
 * Safe fetch wrapper that automatically applies API base URL and returns parsed JSON.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const defaultHeaders = {
    'Accept': 'application/json',
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {})
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
};
