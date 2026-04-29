import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-beige flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <h1 className="font-serif text-7xl font-bold text-green-950 mb-2">404</h1>
        <h2 className="font-serif text-xl font-semibold text-green-950 mb-3">
          Page Not Found
        </h2>
        <p className="font-sans text-sm text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2.5 border border-green-950 text-green-950 font-sans font-semibold rounded-xl hover:bg-green-950 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-green-950 text-white font-sans font-semibold rounded-xl hover:bg-amber-500 transition-colors"
          >
            <Home size={16} />
            Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
