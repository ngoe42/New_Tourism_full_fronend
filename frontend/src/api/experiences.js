import apiClient from './client'

export const experiencesApi = {
  list: () => apiClient.get('/experiences').then((r) => r.data),
  listAll: () => apiClient.get('/experiences/all').then((r) => r.data),
  create: (data) => apiClient.post('/experiences', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/experiences/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/experiences/${id}`),
  reorder: (items) => apiClient.post('/experiences/reorder', items).then((r) => r.data),
}
