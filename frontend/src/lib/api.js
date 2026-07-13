// Lightweight fetch-based HTTP client with an axios-compatible surface
// (api.get/post/put/delete returning { data, status }). Used instead of axios
// because the axios XHR/fetch adapters hang in this runtime environment.

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const BACKEND = BACKEND_URL;

function buildUrl(path, params) {
  let url = path.startsWith("http") ? path : `${API}${path}`;
  if (params && typeof params === "object") {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    ).toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }
  return url;
}

async function request(method, path, body, config = {}) {
  const url = buildUrl(path, config.params);
  const headers = { ...(config.headers || {}) };

  const token = localStorage.getItem("uono_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let payload;
  if (body instanceof FormData) {
    payload = body; // browser sets multipart boundary
  } else if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, { method, headers, body: payload });
  } catch (e) {
    const err = new Error("Network Error");
    err.request = true;
    throw err;
  }

  const ct = res.headers.get("content-type") || "";
  let data = null;
  if (ct.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    const txt = await res.text().catch(() => "");
    data = txt;
  }

  if (!res.ok) {
    if (res.status === 401 && !path.includes("/auth/login")) {
      localStorage.removeItem("uono_token");
      const p = window.location.pathname;
      if (p.startsWith("/admin") && !p.includes("/admin/login")) {
        window.location.href = "/admin/login?expired=1";
      }
    }
    const err = new Error(`Request failed with status code ${res.status}`);
    err.response = { status: res.status, data };
    throw err;
  }

  return { data, status: res.status, headers: res.headers };
}

const api = {
  get: (path, config) => request("GET", path, undefined, config),
  post: (path, body, config) => request("POST", path, body, config),
  put: (path, body, config) => request("PUT", path, body, config),
  patch: (path, body, config) => request("PATCH", path, body, config),
  delete: (path, config) => request("DELETE", path, undefined, config),
};

// Resolve a stored file url (relative /api/uploads/...) to an absolute URL
export const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
};

export default api;
