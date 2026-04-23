import apiClient from './client'

export const usersApi = {
  me: () => apiClient.get('/users/me').then((r) => r.data),

  updateMe: (data) => apiClient.put('/users/me', data).then((r) => r.data),

  changePassword: (current_password, new_password) =>
    apiClient.put('/users/me/password', { current_password, new_password }).then((r) => r.data),
}
