"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { motion } from "framer-motion"
import { Database, Github, Mail, Sparkles } from "lucide-react"

function SignInContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const error = searchParams.get("error")

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-zinc-950 to-zinc-950" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNCA2LjI2OCAxNC0xNC0xNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-30" />

      <div className="relative flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Database className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}DataCanvas
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-md mx-auto">
            Transform your data into beautiful visualizations
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center max-w-md"
          >
            {error === "OAuthSignin" && "Error starting authentication. Please try again."}
            {error === "OAuthCallback" && "Error during authentication. Please try again."}
            {error === "OAuthAccountNotLinked" && "This email is already linked to another account."}
            {error === "CredentialsSignin" && "Invalid credentials. Please try again."}
            {!["OAuthSignin", "OAuthCallback", "OAuthAccountNotLinked", "CredentialsSignin"].includes(error) && "An error occurred. Please try again."}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md space-y-4"
        >
          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-zinc-900 rounded-xl font-semibold hover:bg-zinc-100 transition-colors"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>

          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-zinc-900 rounded-xl font-semibold hover:bg-zinc-100 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Continue with Google
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-zinc-400">Sign in to save and share your dashboards</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <a
            href="/"
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            ← Continue without signing in
          </a>
        </motion.div>
      </div>

      <footer className="relative p-6 text-center text-zinc-600 text-sm">
        <p>DataCanvas - Open Source Data Visualization Platform</p>
      </footer>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
