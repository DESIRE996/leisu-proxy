export async function onRequest(context) {
  const request = context.request;
  if (request.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  if (!targetUrl) {
    return new Response('CORS Proxy is running. Use ?url=TARGET_URL to proxy requests.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
    });
  }
  try {
    const init = { method: request.method, headers: {} };
    for (const [key, value] of request.headers.entries()) {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
        init.headers[key] = value;
      }
    }
    if (request.method === 'POST' || request.method === 'PUT') {
      init.body = await request.text();
    }
    const response = await fetch(targetUrl, init);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', '*');
    return new Response(await response.text(), {
      status: response.status,
      headers: newHeaders
    });
  } catch (e) {
    return new Response('Proxy error: ' + e.message, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
    });
  }
}