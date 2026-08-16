const createFetch = (baseUrl = "") => {
  const request = async (endpoint = "", options = {}) => {
    try {
      const setting = await window.electron.getSetting();
      const token = window.localStorage.getItem("token");

      const res = await fetch(`${setting.server}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
        ...options,
      });

      // ==========================================
      // TOKEN EXPIRED / UNAUTHORIZED
      // ==========================================

      if (res.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.electron.closeApp();
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      throw JSON.parse(error.message);
    }
  };

  return {
    // GET request
    get: (endpoint) => request(endpoint, { method: "GET" }),
    // POST request
    post: (endpoint, body) =>
      request(endpoint, { method: "POST", body: JSON.stringify(body) }),
    // PUT request
    put: (endpoint, body) =>
      request(endpoint, { method: "PUT", body: JSON.stringify(body) }),
    patch: (endpoint, body) =>
      request(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
    // DELETE request
    delete: (endpoint) => request(endpoint, { method: "DELETE" }),
  };
};

const api = createFetch("http://localhost:8000");

export default api;
