const APP_ID = import.meta.env.VITE_APP_ID;
const API_KEY = import.meta.env.VITE_APP_API_KEY;

const BASE_URL = import.meta.env.DEV
  ? `/api/apps/${APP_ID}`
  : `/api/proxy`;
  
async function request(endpoint, options = {}) {
  // In productie is endpoint bijv. "/entities/Klant?sort=..."
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

// De rest (createEntityMethods, base44) blijft ongewijzigd

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