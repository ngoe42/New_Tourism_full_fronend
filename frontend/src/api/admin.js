import apiClient from './client'

export const adminApi = {
  stats: () =>
    apiClient.get('/admin/dashboard').then((r) => r.data),

  sendEmail: (data) =>
    apiClient.post('/admin/send-email', data).then((r) => r.data),
}
