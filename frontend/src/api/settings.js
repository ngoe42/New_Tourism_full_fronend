import apiClient from './client'

export const settingsApi = {
  get: () => apiClient.get('/settings').then((r) => r.data),

  update: (data) => apiClient.put('/settings', data).then((r) => r.data),

  setImage: (field, url) =>
    apiClient.put('/settings', { [field]: url }).then((r) => r.data),

  clearImage: (field) =>
    apiClient.put('/settings', { [field]: null }).then((r) => r.data),

  uploadHeroVideo: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return apiClient.post('/settings/hero-video', fd, {
      headers: { 'Content-Type': undefined },
      timeout: 120000,
    }).then((r) => r.data)
  },

  deleteHeroVideo: () => apiClient.delete('/settings/hero-video').then((r) => r.data),

  addHeroImage: (url) =>
    apiClient.post('/settings/hero-images', { url }).then((r) => r.data),

  removeHeroImage: (idx) =>
    apiClient.delete(`/settings/hero-images/${idx}`).then((r) => r.data),
}
