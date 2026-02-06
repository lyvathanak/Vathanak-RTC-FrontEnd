import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("🌐 API Base URL:", API_BASE_URL);
console.log(
  "🌐 Environment:",
  import.meta.env.DEV ? "Development (proxy)" : "Production",
);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

// 🔧 Only skip login (register requires auth on your server)
const SKIP_AUTH = ["/auth/login"];

api.interceptors.request.use(
  (config) => {
    const ls = localStorage.getItem("auth_token");
    const ss = sessionStorage.getItem("auth_token");
    const token = ls || ss;
    // const token = "28|L7fhj0RIaajweeeq8CE7kw4n6HyMobSjEqOFvcfla96e1f56";

    // ✅ FIX: Manually construct the full URL including query params for logging
    let fullUrl = `${config.baseURL || ""}${config.url || ""}`;

    // Check if params exist and append them to the log URL
    if (config.params) {
      const queryString = new URLSearchParams(config.params).toString();
      fullUrl += `?${queryString}`;
    }

    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${fullUrl}`);

    if (token && !SKIP_AUTH.some((p) => (config.url || "").includes(p))) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Added Bearer token to request");
    }

    // Let browser set boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Optional: Uncomment to see responses in console
// api.interceptors.response.use(
//   (response) => {
//     console.log(`✅ Response: ${response.status} ${response.config.url}`);
//     return response;
//   },
//   (error) => {
//     console.error('❌ Response Error:', error.response?.status, error.response?.data);
//     return Promise.reject(error);
//   }
// );

export default api;
