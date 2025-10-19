const API_BASE = import.meta.env.VITE_API_BASE || ""; // prod: abszolút URL, dev: üres -> Vite proxy

export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json", ...(options.headers || {}) },
    ...options,
  });
  return res;
}