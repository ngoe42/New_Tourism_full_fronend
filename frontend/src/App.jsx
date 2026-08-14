import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import SEO from './components/SEO'
import SiteSchema from './components/SiteSchema'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RouteLoadingBar from './components/RouteLoadingBar'
import Home from './pages/Home'
import RequireAdmin from './components/RequireAdmin'
import RequireSuperAdmin from './components/RequireSuperAdmin'
import WhatsAppButton from './components/WhatsAppButton'
import ErrorBoundary from './components/ErrorBoundary'
import NotFound from './pages/NotFound'

// Everything below is code-split out of the initial bundle: the homepage —
// by far the most common entry point — should never pay for the weight of
// the admin dashboard, booking/payment flows, or every overview page.
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

function PublicLayout({ children, title, description, image }) {
  return (
    <>
      <SiteSchema />
      {/* Pages that own their own <SEO> (with canonicalPath/image/jsonLd) render it
          themselves; this fallback only fires for routes that pass title here so
          we never emit two competing <title>/canonical tags for one page. */}
      {title && <SEO title={title} description={description} image={image} />}
      {/* Navbar/Footer stay mounted across a lazy-loaded page transition — only the
          page content itself waits on its code chunk, behind a slim progress bar. */}
      <Navbar />
      <Suspense fallback={<RouteLoadingBar />}>{children}</Suspense>
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
        <Route path="/" element={<PublicLayout title="Nelson Tour and Safari — Luxury Tanzania Safari Tours & Kilimanjaro Treks" description="Tanzania safari tours, Serengeti wildlife safaris and Mount Kilimanjaro treks with a local, Arusha-based operator. Plan your safari and tour of Tanzania with expert guides." image="https://nelsontoursandsafaris.com/images/hero-bg.jpg"><Home /></PublicLayout>} />
        <Route path="/tours" element={<PublicLayout><Tours /></PublicLayout>} />
        <Route path="/tours/:id" element={<PublicLayout><TourDetail /></PublicLayout>} />
        <Route path="/routes" element={<PublicLayout><RoutesList /></PublicLayout>} />
        <Route path="/routes/:slug" element={<PublicLayout><RouteDetail /></PublicLayout>} />
        <Route path="/experiences" element={<PublicLayout title="Experiences — Nelson Tour and Safari" description="Curated luxury experiences across Tanzania — from wildlife safaris to cultural immersions."><Experiences /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout title="Blog — Nelson Tour and Safari" description="Travel guides, tips, and stories from Tanzania's premier safari and trekking experts."><Blog /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/kilimanjaro" element={<PublicLayout title="Mount Kilimanjaro — Nelson Tour and Safari" description="Climb Mount Kilimanjaro with expert local guides. Choose from multiple routes for the adventure of a lifetime."><KilimanjaroOverview /></PublicLayout>} />
        <Route path="/trekking" element={<PublicLayout title="Trekking — Nelson Tour and Safari" description="Trekking adventures across Tanzania's most breathtaking landscapes with experienced guides."><TrekkingOverview /></PublicLayout>} />
        <Route path="/meru" element={<PublicLayout title="Mount Meru — Nelson Tour and Safari" description="Climb Mount Meru — Tanzania's second-highest peak and the perfect warm-up for Kilimanjaro."><MountMeruOverview /></PublicLayout>} />
        <Route path="/oldoinyo-lengai" element={<PublicLayout title="Oldoinyo Lengai — Nelson Tour and Safari" description="Trek the sacred Mountain of God — an active volcanic climb in the Great Rift Valley."><OldoinyoLengaiOverview /></PublicLayout>} />
        <Route path="/safari" element={<PublicLayout title="Tanzania Safaris — Nelson Tour and Safari" description="Luxury safari experiences in Tanzania's most iconic national parks — Serengeti, Ngorongoro, and beyond."><TanzaniaSafariOverview /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout title="Login — Nelson Tour and Safari"><Login /></PublicLayout>} />
        <Route path="/payment/callback" element={<Suspense fallback={<RouteLoadingBar />}><SEO title="Payment — Nelson Tour and Safari" /><PaymentCallback /></Suspense>} />
        <Route path="/booking/:id" element={<PublicLayout title="Booking Confirmation — Nelson Tour and Safari"><BookingConfirmation /></PublicLayout>} />
        <Route path="/payment/resume" element={<Suspense fallback={<RouteLoadingBar />}><SEO title="Resume Payment — Nelson Tour and Safari" /><PaymentResume /></Suspense>} />
        <Route path="/login/admin" element={<Suspense fallback={<RouteLoadingBar />}><SEO title="Admin Login — Nelson Tour and Safari" /><SuperAdminLogin /></Suspense>} />
        <Route path="/login/admin/forgot" element={<Suspense fallback={<RouteLoadingBar />}><SEO title="Forgot Password — Nelson Tour and Safari" /><ForgotPassword /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<RouteLoadingBar />}><SEO title="Reset Password — Nelson Tour and Safari" /><ResetPassword /></Suspense>} />

        {/* Admin routes — one Suspense boundary covers AdminLayout plus whichever
            nested admin page renders in its <Outlet/>, since they share the tree. */}
        <Route path="/admin" element={<Suspense fallback={<RouteLoadingBar />}><SEO title="Admin — Nelson Tour and Safari" noindex /><RequireAdmin><AdminLayout /></RequireAdmin></Suspense>}>
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
