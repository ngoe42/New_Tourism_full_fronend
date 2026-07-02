import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import SEO from './components/SEO'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RequireAdmin from './components/RequireAdmin'
import RequireSuperAdmin from './components/RequireSuperAdmin'
import WhatsAppButton from './components/WhatsAppButton'
import ErrorBoundary from './components/ErrorBoundary'

const Home = lazy(() => import('./pages/Home'))
const Tours = lazy(() => import('./pages/Tours'))
const TourDetail = lazy(() => import('./pages/TourDetail'))
const RoutesList = lazy(() => import('./pages/RoutesList'))
const RouteDetail = lazy(() => import('./pages/RouteDetail'))
const Contact = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./pages/Login'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminTours = lazy(() => import('./pages/admin/AdminTours'))
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'))
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'))
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'))
const AdminExperiences = lazy(() => import('./pages/admin/AdminExperiences'))
const AdminRoutes = lazy(() => import('./pages/admin/AdminRoutes'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminRoles = lazy(() => import('./pages/admin/AdminRoles'))
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'))
const SuperAdminLogin = lazy(() => import('./pages/SuperAdminLogin'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Experiences = lazy(() => import('./pages/Experiences'))
const Blog = lazy(() => import('./pages/Blog'))
const About = lazy(() => import('./pages/About'))
const KilimanjaroOverview = lazy(() => import('./pages/KilimanjaroOverview'))
const TrekkingOverview = lazy(() => import('./pages/TrekkingOverview'))
const MountMeruOverview = lazy(() => import('./pages/MountMeruOverview'))
const OldoinyoLengaiOverview = lazy(() => import('./pages/OldoinyoLengaiOverview'))
const TanzaniaSafariOverview = lazy(() => import('./pages/TanzaniaSafariOverview'))
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'))
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'))
const PaymentResume = lazy(() => import('./pages/PaymentResume'))
const NotFound = lazy(() => import('./pages/NotFound'))

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

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
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
