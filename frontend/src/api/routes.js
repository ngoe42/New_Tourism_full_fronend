import apiClient from './client'

export const routesApi = {
  list: (publishedOnly = true) =>
    apiClient.get('/routes/', { params: { published_only: publishedOnly } }).then((r) => r.data),

  listAll: () =>
    apiClient.get('/routes/', { params: { published_only: false } }).then((r) => r.data),

  getBySlug: (slug) => apiClient.get(`/routes/${slug}`).then((r) => r.data),

  getById: (id) => apiClient.get(`/routes/${id}`).then((r) => r.data),

  create: (data) => apiClient.post('/routes/', data).then((r) => r.data),

  update: (id, data) => apiClient.put(`/routes/${id}`, data).then((r) => r.data),

  delete: (id) => apiClient.delete(`/routes/${id}`),

  uploadImage: (routeId, file, caption = '', isCover = false) => {
    const form = new FormData()
    form.append('file', file)
    if (caption) form.append('caption', caption)
    form.append('is_cover', isCover)
    return apiClient
      .post(`/routes/${routeId}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },

  deleteImage: (routeId, imageId) => apiClient.delete(`/routes/${routeId}/images/${imageId}`),
}
