import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Tours from './pages/Tours'
import TourDetail from './pages/TourDetail'
import RoutesList from './pages/RoutesList'
import RouteDetail from './pages/RouteDetail'
import Contact from './pages/Contact'
import Login from './pages/Login'
import RequireAdmin from './components/RequireAdmin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTours from './pages/admin/AdminTours'
import AdminBookings from './pages/admin/AdminBookings'
import AdminTestimonials from './pages/admin/AdminTestimonials'
import AdminInquiries from './pages/admin/AdminInquiries'
import AdminExperiences from './pages/admin/AdminExperiences'
import AdminRoutes from './pages/admin/AdminRoutes'
import AdminSettings from './pages/admin/AdminSettings'
import AdminUsers from './pages/admin/AdminUsers'
import AdminRoles from './pages/admin/AdminRoles'
import AdminProfile from './pages/admin/AdminProfile'
import Experiences from './pages/Experiences'
import Blog from './pages/Blog'
import About from './pages/About'
import WhatsAppButton from './components/WhatsAppButton'
import PaymentCallback from './pages/PaymentCallback'
import PaymentResume from './pages/PaymentResume'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  )
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/tours" element={<PublicLayout><Tours /></PublicLayout>} />
        <Route path="/tours/:id" element={<PublicLayout><TourDetail /></PublicLayout>} />
        <Route path="/routes" element={<PublicLayout><RoutesList /></PublicLayout>} />
        <Route path="/routes/:slug" element={<PublicLayout><RouteDetail /></PublicLayout>} />
        <Route path="/experiences" element={<PublicLayout><Experiences /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/payment/resume" element={<PaymentResume />} />

        {/* Admin routes */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="tours" element={<AdminTours />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="experiences" element={<AdminExperiences />} />
          <Route path="routes" element={<AdminRoutes />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}
