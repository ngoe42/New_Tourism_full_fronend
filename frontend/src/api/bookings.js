import apiClient from './client'

export const bookingsApi = {
  create: (data) =>
    apiClient.post('/bookings', data).then((r) => r.data),

  myBookings: (params = {}) =>
    apiClient.get('/bookings/me', { params }).then((r) => r.data),

  getById: (id) =>
    apiClient.get(`/bookings/${id}`).then((r) => r.data),

  all: (params = {}) =>
    apiClient.get('/bookings', { params }).then((r) => r.data),

  updateStatus: (id, status, notes) =>
    apiClient.put(`/bookings/${id}/status`, { status, notes }).then((r) => r.data),

  initiatePayment: (bookingId) =>
    apiClient.post(`/payments/initiate/${bookingId}`).then((r) => r.data),

  pollPaymentStatus: (bookingId) =>
    apiClient.get(`/payments/status/${bookingId}`).then((r) => r.data),

  getPaymentLink: (bookingId) =>
    apiClient.get(`/payments/link/${bookingId}`).then((r) => r.data),

  refreshPaymentLink: (bookingId) =>
    apiClient.post(`/payments/initiate/${bookingId}`).then((r) => r.data),
}
