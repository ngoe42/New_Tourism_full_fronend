import apiClient from './client'

export const userManagementApi = {
  // ── Permissions ──────────────────────────────────────────────
  listPermissions: () =>
    apiClient.get('/manage/permissions').then((r) => r.data),

  // ── Roles ────────────────────────────────────────────────────
  listRoles: () =>
    apiClient.get('/manage/roles').then((r) => r.data),

  getRole: (id) =>
    apiClient.get(`/manage/roles/${id}`).then((r) => r.data),

  createRole: (data) =>
    apiClient.post('/manage/roles', data).then((r) => r.data),

  updateRole: (id, data) =>
    apiClient.put(`/manage/roles/${id}`, data).then((r) => r.data),

  deleteRole: (id) =>
    apiClient.delete(`/manage/roles/${id}`).then((r) => r.data),

  // ── Users ────────────────────────────────────────────────────
  listUsers: (params = {}) =>
    apiClient.get('/manage/users', { params }).then((r) => r.data),

  getUser: (id) =>
    apiClient.get(`/manage/users/${id}`).then((r) => r.data),

  createUser: (data) =>
    apiClient.post('/manage/users', data).then((r) => r.data),

  updateUser: (id, data) =>
    apiClient.put(`/manage/users/${id}`, data).then((r) => r.data),

  deleteUser: (id) =>
    apiClient.delete(`/manage/users/${id}`).then((r) => r.data),

  eraseCustomerData: (id) =>
    apiClient.post(`/manage/users/${id}/erase`).then((r) => r.data),
}
