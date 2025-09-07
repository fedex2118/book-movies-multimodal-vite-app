const API_BASE = import.meta.env.VITE_BASE_API;

export async function getMovies() {
    const res = await fetch(`${API_BASE}/movies`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function fetchJSON(url) {
  //console.log('[fetchJSON] →', url);
  const res = await fetch(url);
  const ct = res.headers.get('content-type') || '';
  const txt = await res.text().catch(() => '');
  //console.log('[fetchJSON] status', res.status, 'ct', ct, 'body start:', txt.slice(0, 120));

  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}. Body: ${txt.slice(0, 200)}`);
  if (!ct.includes('application/json')) throw new Error(`Expected JSON, got ${ct}. Body: ${txt.slice(0, 200)}`);
  return JSON.parse(txt);
}

export const api = {
  resolveScreening: ({ title, day, time }) =>
    fetchJSON(`${API_BASE}/resolve-screening?title=${encodeURIComponent(title)}&day=${encodeURIComponent(day)}&time=${encodeURIComponent(time)}`),
  getLayout: (id) => fetchJSON(`${API_BASE}/screenings/${id}/layout`),
};
