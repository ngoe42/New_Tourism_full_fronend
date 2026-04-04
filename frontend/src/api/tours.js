import apiClient from './client'

export const toursApi = {
  list: (params = {}) =>
    apiClient.get('/tours', { params }).then((r) => r.data),

  featured: (limit = 6) =>
    apiClient.get('/tours/featured', { params: { limit } }).then((r) => r.data),

  getBySlug: (slug) =>
    apiClient.get(`/tours/${slug}`).then((r) => r.data),

  getById: (id) =>
    apiClient.get(`/tours/${id}`).then((r) => r.data),

  create: (data) =>
    apiClient.post('/tours', data).then((r) => r.data),

  update: (id, data) =>
    apiClient.put(`/tours/${id}`, data).then((r) => r.data),

  delete: (id) =>
    apiClient.delete(`/tours/${id}`),

  uploadImage: (tourId, file, isCover = false) => {
    const form = new FormData()
    form.append('file', file)
    form.append('is_cover', isCover)
    return apiClient
      .post(`/tours/${tourId}/images`, form)
      .then((r) => r.data)
  },

  deleteImage: (tourId, imageId) =>
    apiClient.delete(`/tours/${tourId}/images/${imageId}`),
}
