import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import SEO from './components/SEO'
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
import SuperAdminLogin from './pages/SuperAdminLogin'
import RequireSuperAdmin from './components/RequireSuperAdmin'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Experiences from './pages/Experiences'
import Blog from './pages/Blog'
import About from './pages/About'
import KilimanjaroOverview from './pages/KilimanjaroOverview'
import TrekkingOverview from './pages/TrekkingOverview'
import MountMeruOverview from './pages/MountMeruOverview'
import OldoinyoLengaiOverview from './pages/OldoinyoLengaiOverview'
import TanzaniaSafariOverview from './pages/TanzaniaSafariOverview'
import WhatsAppButton from './components/WhatsAppButton'
import PaymentCallback from './pages/PaymentCallback'
import BookingConfirmation from './pages/BookingConfirmation'
import PaymentResume from './pages/PaymentResume'
import ErrorBoundary from './components/ErrorBoundary'
import NotFound from './pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // data considered fresh for 5 min
      gcTime:    1000 * 60 * 15,  // unused cache cleared after 15 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PublicLayout({ children, title, description }) {
  return (
    <>
      <SEO title={title} description={description} />
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
        <Route path="/" element={<PublicLayout title="Nelson Tour and Safari — Luxury Tanzania Experiences" description="World-class luxury safari experiences in Tanzania. Crafted by local experts for unforgettable adventures."><Home /></PublicLayout>} />
        <Route path="/tours" element={<PublicLayout title="Tours — Nelson Tour and Safari" description="Explore our curated selection of luxury safari tours and mountain trekking adventures in Tanzania."><Tours /></PublicLayout>} />
        <Route path="/tours/:id" element={<PublicLayout><TourDetail /></PublicLayout>} />
        <Route path="/routes" element={<PublicLayout title="Climbing Routes — Nelson Tour and Safari" description="Discover the best climbing routes for Kilimanjaro, Meru, and other Tanzanian peaks."><RoutesList /></PublicLayout>} />
        <Route path="/routes/:slug" element={<PublicLayout><RouteDetail /></PublicLayout>} />
        <Route path="/experiences" element={<PublicLayout title="Experiences — Nelson Tour and Safari" description="Curated luxury experiences across Tanzania — from wildlife safaris to cultural immersions."><Experiences /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout title="Blog — Nelson Tour and Safari" description="Travel guides, tips, and stories from Tanzania's premier safari and trekking experts."><Blog /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout title="About Us — Nelson Tour and Safari" description="Meet the local experts behind Nelson Tour and Safari — your trusted guide to Tanzania."><About /></PublicLayout>} />
        <Route path="/kilimanjaro" element={<PublicLayout title="Mount Kilimanjaro — Nelson Tour and Safari" description="Climb Mount Kilimanjaro with expert local guides. Choose from multiple routes for the adventure of a lifetime."><KilimanjaroOverview /></PublicLayout>} />
        <Route path="/trekking" element={<PublicLayout title="Trekking — Nelson Tour and Safari" description="Trekking adventures across Tanzania's most breathtaking landscapes with experienced guides."><TrekkingOverview /></PublicLayout>} />
        <Route path="/meru" element={<PublicLayout title="Mount Meru — Nelson Tour and Safari" description="Climb Mount Meru — Tanzania's second-highest peak and the perfect warm-up for Kilimanjaro."><MountMeruOverview /></PublicLayout>} />
        <Route path="/oldoinyo-lengai" element={<PublicLayout title="Oldoinyo Lengai — Nelson Tour and Safari" description="Trek the sacred Mountain of God — an active volcanic climb in the Great Rift Valley."><OldoinyoLengaiOverview /></PublicLayout>} />
        <Route path="/safari" element={<PublicLayout title="Tanzania Safaris — Nelson Tour and Safari" description="Luxury safari experiences in Tanzania's most iconic national parks — Serengeti, Ngorongoro, and beyond."><TanzaniaSafariOverview /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout title="Contact Us — Nelson Tour and Safari" description="Get in touch with Nelson Tour and Safari. Plan your dream Tanzanian adventure today."><Contact /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout title="Login — Nelson Tour and Safari"><Login /></PublicLayout>} />
        <Route path="/payment/callback" element={<><SEO title="Payment — Nelson Tour and Safari" /><PaymentCallback /></>} />
        <Route path="/booking/:id" element={<PublicLayout title="Booking Confirmation — Nelson Tour and Safari"><BookingConfirmation /></PublicLayout>} />
        <Route path="/payment/resume" element={<><SEO title="Resume Payment — Nelson Tour and Safari" /><PaymentResume /></>} />
        <Route path="/login/admin" element={<><SEO title="Admin Login — Nelson Tour and Safari" /><SuperAdminLogin /></>} />
        <Route path="/login/admin/forgot" element={<><SEO title="Forgot Password — Nelson Tour and Safari" /><ForgotPassword /></>} />
        <Route path="/reset-password" element={<><SEO title="Reset Password — Nelson Tour and Safari" /><ResetPassword /></>} />

        {/* Admin routes */}
        <Route path="/admin" element={<><SEO title="Admin — Nelson Tour and Safari" noindex /><RequireAdmin><AdminLayout /></RequireAdmin></>}>
          <Route index element={<AdminDashboard />} />
          <Route path="tours" element={<AdminTours />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="experiences" element={<AdminExperiences />} />
          <Route path="routes" element={<AdminRoutes />} />
          <Route path="settings" element={<RequireSuperAdmin><AdminSettings /></RequireSuperAdmin>} />
          <Route path="users" element={<RequireSuperAdmin><AdminUsers /></RequireSuperAdmin>} />
          <Route path="roles" element={<RequireSuperAdmin><AdminRoles /></RequireSuperAdmin>} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<PublicLayout title="Page Not Found — Nelson Tour and Safari"><NotFound /></PublicLayout>} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}
