import apiClient from './client'

export const settingsApi = {
  get: () => apiClient.get('/settings').then((r) => r.data),
  update: (data) => apiClient.put('/settings', data).then((r) => r.data),
  uploadHeroVideo: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return apiClient.post('/settings/hero-video', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }).then((r) => r.data)
  },
  deleteHeroVideo: () => apiClient.delete('/settings/hero-video').then((r) => r.data),
}
