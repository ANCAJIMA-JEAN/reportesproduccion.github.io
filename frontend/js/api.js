/* Comunicación con Apps Script. POST text/plain evita preflight CORS. */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NET = { code: 'NET', message: 'No se pudo conectar con Google Sheets.' };

async function api(action, payload = {}) {
  let j;
  try {
    const r = await fetch(APP_CONFIG.API_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: Auth.token(), action, payload })
    });
    j = await r.json();
  } catch (e) { throw NET; }
  if (!j.ok) throw { code: j.code, message: j.error };
  return j.data;
}

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.add('hidden'), 4000);
}
