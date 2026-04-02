import apiClient from './client'

export const testimonialsApi = {
  list: (params = {}) =>
    apiClient.get('/testimonials', { params }).then((r) => r.data),

  listAll: (params = {}) =>
    apiClient.get('/testimonials/all', { params }).then((r) => r.data),

  create: (data) =>
    apiClient.post('/testimonials', data).then((r) => r.data),

  approve: (id) =>
    apiClient.put(`/testimonials/${id}/approve`).then((r) => r.data),

  delete: (id) =>
    apiClient.delete(`/testimonials/${id}`),
}
