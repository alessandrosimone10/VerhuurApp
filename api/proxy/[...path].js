export default async function handler(req, res) {
  // Haal het opgevraagde pad op (bijv. "entities/Klant")
  const pathSegments = req.query.path || [];
  const entityPath = pathSegments.join('/');

  // Bouw de volledige Base44‑URL
  const targetUrl = new URL(`https://api.base44.com/v1/apps/${process.env.VITE_APP_ID}/${entityPath}`);

  // Voeg query‑parameters toe (zoals sort, limit, filters)
  Object.keys(req.query).forEach(key => {
    if (key !== 'path') targetUrl.searchParams.append(key, req.query[key]);
  });

  const headers = {
    'api_key': process.env.VITE_APP_API_KEY,
    'Content-Type': 'application/json',
  };

  const fetchOptions = {
    method: req.method,
    headers,
  };
  if (req.method !== 'GET') fetchOptions.body = JSON.stringify(req.body);

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}