// src/api/base44Client.js
const APP_ID = process.env.REACT_APP_APP_ID;
const API_KEY = process.env.REACT_APP_API_KEY;
const BASE_URL = `/api/apps/${APP_ID}`;

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'api_key': API_KEY,
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function createEntityMethods(entityName) {
  return {
    list: (sort = "-created_date", limit = 500) => {
      // Je kunt sort en limit verwerken in de query parameters
      return request(`/entities/${entityName}?sort=${sort}&limit=${limit}`);
    },
    update: (id, data) => {
      return request(`/entities/${entityName}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    // Voeg create, delete toe als nodig
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