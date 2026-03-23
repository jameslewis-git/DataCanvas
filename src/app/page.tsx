"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Database, LogIn, LogOut, Layout, Layers, BarChart3, Grid3X3, List } from "lucide-react"
import { FileUploader } from "@/components/FileUploader"
import { DataViewer } from "@/components/DataViewer"
import { DataRow } from "@/lib/parser"
import Link from "next/link"

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-zinc-950 to-zinc-950" />
      
      {/* Animated orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/20 rounded-full blur-[128px]"
      />
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-600/15 rounded-full blur-[100px]"
      />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_100%)]" />
    </div>
  )
}

function FloatingShape({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
      className={className}
    />
  )
}

function Header({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null } | null }) {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="relative z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-zinc-950/50 border-b border-white/5"
    >
      <Link href="/" className="flex items-center gap-3 group">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="relative"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-50 blur-lg group-hover:opacity-75 transition-opacity" />
        </motion.div>
        <div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">DataCanvas</span>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Visualization Engine</p>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <Link
            href="/dashboard"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white/90 transition-all hover:scale-105"
          >
            <Layout className="w-4 h-4" />
            Dashboard
          </Link>
        )}

        {user ? (
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              {user.image ? (
                <img src={user.image} alt={user.name || "User"} className="w-9 h-9 rounded-full border-2 border-white/20" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/20">
                  <span className="text-white font-bold text-sm">{user.name?.[0] || user.email?.[0] || "U"}</span>
                </div>
              )}
            </motion.button>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              whileHover={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-full mt-3 w-56 py-3 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
            >
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-semibold text-white">{user.name || "User"}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
              <div className="py-2">
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 transition-colors">
                  <Layout className="w-4 h-4" /> My Dashboards
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <Link
            href="/auth/signin"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        )}

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-zinc-400">Live</span>
        </div>
      </div>
    </motion.header>
  )
}

function FeatureCard({ icon: Icon, title, description, delay, color }: { icon: any; title: string; description: string; delay: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400">{description}</p>
    </motion.div>
  )
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{value}</div>
      <div className="text-xs md:text-sm text-zinc-500 mt-1">{label}</div>
    </motion.div>
  )
}

function HeroSection({ onDataLoaded }: { onDataLoaded: (data: DataRow[], filename: string) => void }) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4">
      {/* Floating shapes in background */}
      <FloatingShape className="absolute top-32 left-[10%] w-20 h-20 bg-purple-500/20 rounded-2xl backdrop-blur-sm" delay={0} />
      <FloatingShape className="absolute top-48 right-[15%] w-16 h-16 bg-pink-500/20 rounded-full backdrop-blur-sm" delay={1} />
      <FloatingShape className="absolute bottom-32 left-[20%] w-14 h-14 bg-cyan-500/20 rounded-lg backdrop-blur-sm" delay={2} />
      <FloatingShape className="absolute bottom-48 right-[10%] w-24 h-24 bg-purple-500/10 rounded-2xl backdrop-blur-sm" delay={3} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto mb-12"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-400"
          />
          <span className="text-sm text-zinc-300">Powering data visualization for everyone</span>
        </motion.div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Visualize
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Anything
          </span>
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8"
        >
          Transform JSON & CSV files into beautiful, interactive dashboards. 
          No coding required - just upload and explore.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-8 md:gap-16 mb-12"
        >
          <StatBadge value="1M+" label="Records" />
          <div className="w-px h-12 bg-white/10" />
          <StatBadge value="50+" label="Chart Types" />
          <div className="w-px h-12 bg-white/10" />
          <StatBadge value="∞" label="File Size" />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <div className="w-full max-w-md">
              <FileUploader onDataLoaded={onDataLoaded} />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Features grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="w-full max-w-6xl mx-auto mt-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon={Layers}
            title="Virtual Tables"
            description="Handle millions of rows with smooth virtualization"
            delay={1.2}
            color="from-purple-500 to-indigo-500"
          />
          <FeatureCard
            icon={BarChart3}
            title="Analytics"
            description="Powerful charts and real-time data insights"
            delay={1.3}
            color="from-pink-500 to-rose-500"
          />
          <FeatureCard
            icon={Grid3X3}
            title="Card View"
            description="Beautiful grid layouts for your data"
            delay={1.4}
            color="from-cyan-500 to-blue-500"
          />
          <FeatureCard
            icon={List}
            title="List View"
            description="Clean, organized list presentation"
            delay={1.5}
            color="from-amber-500 to-orange-500"
          />
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center text-zinc-500"
        >
          <div className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-white/50"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
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
        metadata: { rowCount: data.length, columns: data.length > 0 ? Object.keys(data[0] || {}) : [] },
      }),
    })
    if (!response.ok) throw new Error("Failed to save")
    await response.json()
    setIsSaved(true)
    setTimeout(() => router.push(`/dashboard`), 1500)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Header user={session?.user} />

        <main>
          <AnimatePresence mode="wait">
            {data.length === 0 ? (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <HeroSection onDataLoaded={handleDataLoaded} />
              </motion.div>
            ) : (
              <motion.div
                key="viewer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-[calc(100vh-80px)]"
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