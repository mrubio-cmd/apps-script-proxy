// Proxy para tu Apps Script Web App
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJ0is7kpVlpOINkrRkvRYzlbvZPovNELFjduemEuk0-6mYqx6uqUcPv2ydLSER11A/exec';

export default async function handler(req, res) {
  try {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const target = APPS_SCRIPT_URL + qs;

    const init = {
      method: req.method,
      headers: Object.fromEntries(
        Object.entries(req.headers).filter(([k]) =>
          !['host', 'content-length', 'connection', 'accept-encoding'].includes(k.toLowerCase())
        )
      ),
      body: (req.method === 'GET' || req.method === 'HEAD') ? undefined : req
    };

    const r = await fetch(target, init);
    res.status(r.status);

    r.headers.forEach((v, k) => {
      if (!['content-security-policy', 'content-length'].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });

    const buf = Buffer.from(await r.arrayBuffer());
    res.send(buf);
  } catch (e) {
    res.status(502).send('Proxy error: ' + (e?.message || e));
  }
}
