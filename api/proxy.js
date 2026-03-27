// api/proxy.js
export default async function handler(req, res) {
  // Bepaal het pad na /api/proxy/
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api\/proxy\//, ''); // haal /api/proxy/ weg

  const appId = process.env.VITE_APP_ID;
  const apiKey = process.env.VITE_APP_API_KEY;

  if (!appId || !apiKey) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  // Bouw de Base44‑URL
  const targetUrl = `https://api.base44.com/v1/apps/${appId}/${path}`;

  // Voeg query parameters toe
  const targetUrlObj = new URL(targetUrl);
  for (const [key, value] of url.searchParams) {
    targetUrlObj.searchParams.append(key, value);
  }

  const fetchOptions = {
    method: req.method,
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(targetUrlObj, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}