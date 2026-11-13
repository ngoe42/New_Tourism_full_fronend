import apiClient from './client'

export const bookingsApi = {
  create: (data) =>
    apiClient.post('/bookings', data).then((r) => r.data),

  lookupPublic: (id, email) =>
    apiClient.get('/bookings/lookup', { params: { id, email } }).then((r) => r.data),

  myBookings: (params = {}) =>
    apiClient.get('/bookings/me', { params }).then((r) => r.data),

  getById: (id) =>
    apiClient.get(`/bookings/${id}`).then((r) => r.data),

  all: (params = {}) =>
    apiClient.get('/bookings', { params }).then((r) => r.data),

  updateStatus: (id, status, notes) =>
    apiClient.put(`/bookings/${id}/status`, { status, notes }).then((r) => r.data),

  // `token` is the booking's payment_token — required for guest bookings.
  initiatePayment: (bookingId, token) =>
    apiClient.post(`/payments/initiate/${bookingId}`, null, { params: { token } }).then((r) => r.data),

  // Pass either the booking token or the Pesapal OrderTrackingId (callback page).
  pollPaymentStatus: (bookingId, { token, trackingId } = {}) =>
    apiClient
      .get(`/payments/status/${bookingId}`, { params: { token, tracking_id: trackingId } })
      .then((r) => r.data),

  getPaymentLink: (bookingId, token) =>
    apiClient.get(`/payments/link/${bookingId}`, { params: { token } }).then((r) => r.data),

  refreshPaymentLink: (bookingId, token) =>
    apiClient.post(`/payments/initiate/${bookingId}`, null, { params: { token } }).then((r) => r.data),

  update: (id, data) =>
    apiClient.put(`/bookings/${id}`, data).then((r) => r.data),

  delete: (id) =>
    apiClient.delete(`/bookings/${id}`),
}
