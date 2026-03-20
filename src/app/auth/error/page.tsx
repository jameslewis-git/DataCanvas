"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Database, AlertTriangle, ArrowLeft } from "lucide-react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const defaultError = {
    title: "Authentication Error",
    description: "An error occurred during authentication. Please try again."
  }

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: "Server Configuration Error",
      description: "There is a problem with the server configuration. Please contact support."
    },
    AccessDenied: {
      title: "Access Denied",
      description: "You do not have permission to access this resource."
    },
    Verification: {
      title: "Verification Error",
      description: "The verification link has expired or has already been used."
    }
  }

  const errorInfo = error ? (errorMessages[error] || defaultError) : defaultError

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950" />

      <div className="relative flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              {errorInfo.title}
            </span>
          </h1>

          <p className="text-zinc-400 mb-8">
            {errorInfo.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Try Again
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-colors"
            >
              Go Home
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Database className="w-4 h-4 text-white" />
          </div>
          <span className="text-zinc-500 text-sm">DataCanvas</span>
        </motion.div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
