// src/api/base44Client.js

const APP_ID = import.meta.env.VITE_APP_ID;
const API_KEY = import.meta.env.VITE_APP_API_KEY;

// Gebruik in ontwikkeling de proxy, in productie de absolute URL
const BASE_URL = import.meta.env.DEV
  ? `/api/apps/${APP_ID}`               // development: via Vite proxy
  : `https://api.base44.com/v1/apps/${APP_ID}`; // productie: direct

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'api_key': API_KEY,
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

function createEntityMethods(entityName) {
  return {
    list: (filters = {}, sort = "-created_date", limit = 500) => {
      const params = new URLSearchParams({ ...filters, sort, limit }).toString();
      return request(`/entities/${entityName}?${params}`);
    },
    filter: (filters = {}) => {
      const params = new URLSearchParams(filters).toString();
      return request(`/entities/${entityName}?${params}`);
    },
    create: (data) => request(`/entities/${entityName}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/entities/${entityName}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/entities/${entityName}/${id}`, { method: 'DELETE' }),
  };
}

export const base44 = {
  entities: {
    Factuur: createEntityMethods('Factuur'),
    Klant: createEntityMethods('Klant'),
    Verhuur: createEntityMethods('Verhuur'),
    Racket: createEntityMethods('Racket'),
    Instelling: createEntityMethods('Instelling'),
  },
};