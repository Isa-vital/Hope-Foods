// API Client for Hope Foods Backend
// Centralizes all HTTP communication, token handling, and response normalization.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "hopefoods_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Format a numeric price (e.g. 25000) as a UGX label ("UGX 25,000").
 * Frontend components rely on item.price being this formatted string.
 */
export const formatUGX = (n) => `UGX ${Number(n).toLocaleString("en-US")}`;

/**
 * Normalize a menu item from the API to the shape the frontend expects.
 * Keeps numeric price in `priceNumber` and a formatted label in `price`.
 */
export const normalizeMenuItem = (item) => ({
  ...item,
  priceNumber: Number(item.price),
  price: formatUGX(item.price),
});

/**
 * Low-level request helper.
 * @param {string} path - API path starting with '/'
 * @param {RequestInit} options
 */
async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = { success: false, message: `Invalid response (${res.status})` };
  }

  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

// ---------- Domain helpers ----------

export const menuApi = {
  /** Returns categories grouped with normalized items: { "Local Foods": [...], ... } */
  getMenuGrouped: async () => {
    const res = await api.get("/menu");
    const grouped = {};
    for (const cat of res.data) {
      grouped[cat.name] = cat.items.map(normalizeMenuItem);
    }
    return grouped;
  },
  getCategories: () => api.get("/menu/categories"),
  getItem: async (id) => {
    const res = await api.get(`/menu/items/${id}`);
    return { ...res, data: normalizeMenuItem(res.data) };
  },
  createItem: (item) => api.post("/menu/items", item),
  updateItem: (id, item) => api.patch(`/menu/items/${id}`, item),
  deleteItem: (id) => api.delete(`/menu/items/${id}`),
};

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (email, password) => api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
  updateProfile: (payload) => api.patch("/auth/profile", payload),
  changePassword: (current_password, new_password) =>
    api.post("/auth/change-password", { current_password, new_password }),
};

export const ordersApi = {
  create: (payload) => api.post("/orders", payload),
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/orders${qs ? `?${qs}` : ""}`);
  },
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  todayStats: () => api.get("/orders/stats/today"),
};

export const reservationsApi = {
  create: (payload) => api.post("/reservations", payload),
  get: (id) => api.get(`/reservations/${id}`),
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/reservations${qs ? `?${qs}` : ""}`);
  },
  updateStatus: (id, status, table_id) =>
    api.patch(`/reservations/${id}/status`, { status, table_id }),
};

export const tablesApi = {
  list: () => api.get("/tables"),
  create: (payload) => api.post("/tables", payload),
  update: (id, payload) => api.patch(`/tables/${id}`, payload),
  remove: (id) => api.delete(`/tables/${id}`),
};
export const paymentsApi = {
  record: (payload) => api.post('/payments', payload),
  list: (order_id) => api.get(`/payments${order_id ? `?order_id=${order_id}` : ''}`)
};

export const roomsApi = {
  listTypes: () => api.get('/rooms/types'),
  createType: (payload) => api.post('/rooms/types', payload),
  updateType: (id, payload) => api.patch(`/rooms/types/${id}`, payload),
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/rooms${qs ? `?${qs}` : ''}`);
  },
  availability: (check_in, check_out) =>
    api.get(`/rooms/availability?check_in=${check_in}&check_out=${check_out}`),
  create: (payload) => api.post('/rooms', payload),
  update: (id, payload) => api.patch(`/rooms/${id}`, payload),
  remove: (id) => api.delete(`/rooms/${id}`),
};

export const bookingsApi = {
  create: (payload) => api.post('/bookings', payload),
  get: (id) => api.get(`/bookings/${id}`),
  me: () => api.get('/bookings/me'),
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/bookings${qs ? `?${qs}` : ''}`);
  },
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

export const inventoryApi = {
  listSuppliers: () => api.get('/inventory/suppliers'),
  createSupplier: (payload) => api.post('/inventory/suppliers', payload),
  updateSupplier: (id, payload) => api.patch(`/inventory/suppliers/${id}`, payload),
  deleteSupplier: (id) => api.delete(`/inventory/suppliers/${id}`),
  listItems: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/inventory/items${qs ? `?${qs}` : ''}`);
  },
  createItem: (payload) => api.post('/inventory/items', payload),
  updateItem: (id, payload) => api.patch(`/inventory/items/${id}`, payload),
  deleteItem: (id) => api.delete(`/inventory/items/${id}`),
  listTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/inventory/transactions${qs ? `?${qs}` : ''}`);
  },
  recordTransaction: (payload) => api.post('/inventory/transactions', payload),
};

export const reportsApi = {
  dashboard: () => api.get('/reports/dashboard'),
  sales: (from, to) => api.get(`/reports/sales?from=${from}&to=${to}`),
  topItems: (from, to, limit = 10) => api.get(`/reports/top-items?from=${from}&to=${to}&limit=${limit}`),
  paymentMethods: (from, to) => api.get(`/reports/payment-methods?from=${from}&to=${to}`),
  occupancy: (from, to) => api.get(`/reports/occupancy?from=${from}&to=${to}`),
};

export const shiftsApi = {
  current: () => api.get('/shifts/current'),
  open: (payload) => api.post('/shifts/open', payload),
  close: (id, payload) => api.post(`/shifts/${id}/close`, payload),
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/shifts${qs ? `?${qs}` : ''}`);
  },
};

export const activityLogsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/activity-logs${qs ? `?${qs}` : ''}`);
  },
};

export const uploadsApi = {
  image: async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${API_URL}/uploads/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },
};

export const usersApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/users${qs ? `?${qs}` : ''}`);
  },
  create: (payload) => api.post('/users', payload),
  update: (id, payload) => api.patch(`/users/${id}`, payload),
  remove: (id) => api.delete(`/users/${id}`),
};

export default api;
