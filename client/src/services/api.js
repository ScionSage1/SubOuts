import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Response interceptor for error handling
api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error || error.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

// SubOuts API
export const subOutsApi = {
  getAll: (params) => api.get('/subouts', { params }),
  getGrouped: (params) => api.get('/subouts/grouped', { params }),
  getById: (id) => api.get(`/subouts/${id}`),
  create: (data) => api.post('/subouts', data),
  update: (id, data) => api.put(`/subouts/${id}`, data),
  delete: (id) => api.delete(`/subouts/${id}`),
  updateStatus: (id, status) => api.patch(`/subouts/${id}/status`, { status }),
  incrementLoadsOut: (id) => api.patch(`/subouts/${id}/loads-out`),
  incrementLoadsIn: (id) => api.patch(`/subouts/${id}/loads-in`)
}

// SubOut Items API
export const itemsApi = {
  getBySubOut: (subOutId) => api.get(`/subouts/${subOutId}/items`),
  add: (subOutId, data) => api.post(`/subouts/${subOutId}/items`, data),
  bulkAdd: (subOutId, items) => api.post(`/subouts/${subOutId}/items/bulk`, { items }),
  update: (subOutId, itemId, data) => api.put(`/subouts/${subOutId}/items/${itemId}`, data),
  delete: (subOutId, itemId) => api.delete(`/subouts/${subOutId}/items/${itemId}`)
}

// Vendors API
export const vendorsApi = {
  getAll: (params) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`)
}

// Jobs API
export const jobsApi = {
  getAll: () => api.get('/jobs'),
  getByCode: (jobCode) => api.get(`/jobs/${jobCode}`),
  getSubOuts: (jobCode) => api.get(`/jobs/${jobCode}/subouts`)
}

// Cutlists API
export const cutlistsApi = {
  getPackages: (jobCode) => api.get(`/cutlists/packages/${jobCode}`),
  getLongShapes: (jobCode, pkg) => api.get(`/cutlists/longshapes/${jobCode}`, { params: { package: pkg } }),
  getParts: (jobCode, pkg) => api.get(`/cutlists/parts/${jobCode}`, { params: { package: pkg } }),
  getPullList: (jobCode, pkg) => api.get(`/cutlists/pulllist/${jobCode}`, { params: { package: pkg } }),
  getAvailable: (jobCode, pkg) => api.get(`/cutlists/available/${jobCode}`, { params: { package: pkg } })
}

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getActionItems: () => api.get('/dashboard/action-items'),
  getByVendor: () => api.get('/dashboard/by-vendor'),
  getRecent: (limit) => api.get('/dashboard/recent', { params: { limit } })
}

// Pallets API
export const palletsApi = {
  getBySubOut: (subOutId) => api.get(`/subouts/${subOutId}/pallets`),
  getById: (subOutId, palletId) => api.get(`/subouts/${subOutId}/pallets/${palletId}`),
  create: (subOutId, data) => api.post(`/subouts/${subOutId}/pallets`, data),
  update: (subOutId, palletId, data) => api.put(`/subouts/${subOutId}/pallets/${palletId}`, data),
  delete: (subOutId, palletId) => api.delete(`/subouts/${subOutId}/pallets/${palletId}`),
  updateStatus: (subOutId, palletId, status) => api.patch(`/subouts/${subOutId}/pallets/${palletId}/status`, { status }),
  assignItems: (subOutId, palletId, itemIds) => api.post(`/subouts/${subOutId}/pallets/${palletId}/items`, { itemIds }),
  removeItem: (subOutId, palletId, itemId) => api.delete(`/subouts/${subOutId}/pallets/${palletId}/items/${itemId}`),
  assignToLoad: (subOutId, palletId, loadId) => api.patch(`/subouts/${subOutId}/pallets/${palletId}/assign-load`, { loadId })
}

// Loads API
export const loadsApi = {
  getBySubOut: (subOutId, direction) => api.get(`/subouts/${subOutId}/loads`, { params: { direction } }),
  getById: (subOutId, loadId) => api.get(`/subouts/${subOutId}/loads/${loadId}`),
  create: (subOutId, data) => api.post(`/subouts/${subOutId}/loads`, data),
  update: (subOutId, loadId, data) => api.put(`/subouts/${subOutId}/loads/${loadId}`, data),
  delete: (subOutId, loadId) => api.delete(`/subouts/${subOutId}/loads/${loadId}`),
  updateStatus: (subOutId, loadId, status) => api.patch(`/subouts/${subOutId}/loads/${loadId}/status`, { status }),
  assignItems: (subOutId, loadId, itemIds) => api.post(`/subouts/${subOutId}/loads/${loadId}/items`, { itemIds }),
  removeItem: (subOutId, loadId, itemId) => api.delete(`/subouts/${subOutId}/loads/${loadId}/items/${itemId}`),
  assignPallets: (subOutId, loadId, palletIds) => api.post(`/subouts/${subOutId}/loads/${loadId}/pallets`, { palletIds }),
  removePallet: (subOutId, loadId, palletId) => api.delete(`/subouts/${subOutId}/loads/${loadId}/pallets/${palletId}`)
}

// Communications API
export const communicationsApi = {
  getAll: (params) => api.get('/communications', { params }),
  getFollowUps: () => api.get('/communications/follow-ups'),
  getById: (id) => api.get(`/communications/${id}`),
  create: (data) => api.post('/communications', data),
  update: (id, data) => api.put(`/communications/${id}`, data),
  completeFollowUp: (id) => api.patch(`/communications/${id}/complete-followup`),
  delete: (id) => api.delete(`/communications/${id}`)
}

export default api
