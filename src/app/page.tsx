"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Database, Sparkles, LogIn, LogOut, Layout } from "lucide-react"
import { FileUploader } from "@/components/FileUploader"
import { DataViewer } from "@/components/DataViewer"
import { DataRow } from "@/lib/parser"
import Link from "next/link"

function Header({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null } | null }) {
  return (
    <header className="flex items-center justify-between p-6 border-b border-zinc-800/50">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Database className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          DataCanvas
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors"
            >
              <Layout className="w-4 h-4" />
              Dashboard
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800 transition-colors">
                {user.image ? (
                  <img src={user.image} alt={user.name || "User"} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name?.[0] || user.email?.[0] || "U"}
                    </span>
                  </div>
                )}
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-4 py-2 border-b border-zinc-800">
                  <p className="text-sm font-medium text-white">{user.name || "User"}</p>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link
            href="/auth/signin"
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-sm font-medium transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-zinc-400">Supports JSON & CSV</span>
        </div>
      </div>
    </header>
  )
}

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DataRow[]>([])
  const [filename, setFilename] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  const handleDataLoaded = (loadedData: DataRow[], loadedFilename: string) => {
    setData(loadedData)
    setFilename(loadedFilename)
    setIsSaved(false)
  }

  const handleClear = () => {
    setData([])
    setFilename("")
    setIsSaved(false)
  }

  const handleSave = async () => {
    if (!session?.user || !data.length) return
    const response = await fetch("/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: filename,
        size: new Blob([JSON.stringify(data)]).size,
        type: filename.endsWith(".json") ? "application/json" : "text/csv",
        data,
        metadata: {
          rowCount: data.length,
          columns: data.length > 0 ? Object.keys(data[0] || {}) : [],
        },
      }),
    })
    if (!response.ok) throw new Error("Failed to save")
    await response.json()
    setIsSaved(true)
    setTimeout(() => router.push(`/dashboard`), 1500)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-zinc-950 to-zinc-950" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNCA2LjI2OCAxNC0xNC0xNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-30" />

      <div className="relative">
        <Header user={session?.user} />

        <main className="p-6">
          <AnimatePresence mode="wait">
            {data.length === 0 ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center min-h-[70vh]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Transform Data Into
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {" "}Beautiful Visualizations
                    </span>
                  </h1>
                  <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                    Upload JSON or CSV files to explore, filter, and visualize your data with stunning charts and dashboards
                  </p>
                </motion.div>

                <FileUploader onDataLoaded={handleDataLoaded} />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-12 flex flex-wrap justify-center gap-6 text-zinc-500"
                >
                  {[
                    "Interactive Charts",
                    "Multiple Views",
                    "Smart Detection",
                    "Export & Share",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800"
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      {feature}
                    </div>
                  ))}
                </motion.div>

                {!session && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl max-w-md text-center"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Sign in to Save & Share
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4">
                      Create an account to save your dashboards, export visualizations, and share with others.
                    </p>
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      Get Started Free
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="viewer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[calc(100vh-100px)]"
              >
                <DataViewer
                  data={data}
                  filename={filename}
                  onClear={handleClear}
                  onSave={session?.user ? handleSave : undefined}
                  isSaved={isSaved}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
