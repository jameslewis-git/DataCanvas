"use client"

import { useSession, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import { 
  Database, 
  Plus, 
  Layout, 
  LogOut, 
  Settings, 
  Sparkles,
  FileJson,
  FileSpreadsheet,
  BarChart3,
  Clock
} from "lucide-react"
import Link from "next/link"

const mockDashboards = [
  {
    id: "1",
    name: "Sales Analytics 2024",
    description: "Quarterly sales data visualization",
    type: "json",
    lastModified: "2 hours ago",
    chartCount: 5,
  },
  {
    id: "2",
    name: "Customer Demographics",
    description: "Customer age and location breakdown",
    type: "csv",
    lastModified: "1 day ago",
    chartCount: 8,
  },
  {
    id: "3",
    name: "Website Traffic",
    description: "Monthly traffic analysis",
    type: "json",
    lastModified: "3 days ago",
    chartCount: 4,
  },
]

function DashboardCard({ dashboard }: { dashboard: typeof mockDashboards[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex items-center gap-2">
          {dashboard.type === "json" ? (
            <FileJson className="w-4 h-4 text-purple-400" />
          ) : (
            <FileSpreadsheet className="w-4 h-4 text-green-400" />
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
        {dashboard.name}
      </h3>

      <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
        {dashboard.description}
      </p>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {dashboard.lastModified}
        </div>
        <div>{dashboard.chartCount} charts</div>
      </div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-6">
        <Layout className="w-10 h-10 text-zinc-600" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        No Dashboards Yet
      </h3>
      <p className="text-zinc-400 text-center max-w-md mb-8">
        Create your first dashboard by uploading a JSON or CSV file. 
        Transform your data into beautiful visualizations.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-semibold transition-colors"
      >
        <Plus className="w-5 h-5" />
        Create Dashboard
      </Link>
    </motion.div>
  )
}

function UserMenu({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) {
  return (
    <div className="relative group">
      <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800 transition-colors">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-semibold">
              {user.name?.[0] || user.email?.[0] || "U"}
            </span>
          </div>
        )}
      </button>

      <div className="absolute right-0 top-full mt-2 w-64 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <div className="px-4 py-2 border-b border-zinc-800">
          <p className="font-medium text-white">{user.name || "User"}</p>
          <p className="text-sm text-zinc-400">{user.email}</p>
        </div>
        <div className="py-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-zinc-300 hover:bg-zinc-800 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

function Header({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) {
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            DataCanvas
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Dashboard
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-zinc-400">Dashboard</span>
          </div>

          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Header user={session.user} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Your Dashboards
          </h1>
          <p className="text-zinc-400">
            Manage and view all your data visualization dashboards
          </p>
        </motion.div>

        {mockDashboards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDashboards.map((dashboard) => (
              <DashboardCard key={dashboard.id} dashboard={dashboard} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </>
  )
}
