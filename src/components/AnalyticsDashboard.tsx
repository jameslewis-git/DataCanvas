"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import { DataRow } from "@/lib/parser"
import { cn, formatNumber } from "@/lib/utils"

const COLORS = ["#a855f7", "#ec4899", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#6366f1"]

interface AnalyticsDashboardProps {
  data: DataRow[]
}

function getFieldValues(data: DataRow[], field: string): { value: string; count: number }[] {
  const counts: Record<string, number> = {}
  data.forEach((row) => {
    const val = row[field]
    const key = val === null || val === undefined ? "Unknown" : String(val)
    counts[key] = (counts[key] || 0) + 1
  })
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function StatCard({ title, value, subtitle, color }: { title: string; value: string | number; subtitle?: string; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5"
    >
      <p className="text-zinc-400 text-sm mb-1">{title}</p>
      <p className={cn("text-3xl font-bold", color || "text-white")}>{formatNumber(Number(value))}</p>
      {subtitle && <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>}
    </motion.div>
  )
}

function CategoryChart({ data }: { data: DataRow[] }) {
  const chartData = useMemo(() => getFieldValues(data, "categoryName"), [data])

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">Categories Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis type="number" stroke="#71717a" />
          <YAxis dataKey="value" type="category" stroke="#71717a" width={100} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }} />
          <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function CityChart({ data }: { data: DataRow[] }) {
  const chartData = useMemo(() => getFieldValues(data, "city"), [data])

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">Top Cities</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="value"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function RatingsChart({ data }: { data: DataRow[] }) {
  const chartData = useMemo(() => {
    const ratings = getFieldValues(data, "totalScore")
    return ratings.filter(r => r.value !== "Unknown").map(r => ({ name: r.value, value: r.count }))
  }, [data])

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">Ratings Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis dataKey="name" stroke="#71717a" />
          <YAxis stroke="#71717a" />
          <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }} />
          <Area type="monotone" dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function CountryChart({ data }: { data: DataRow[] }) {
  const chartData = useMemo(() => getFieldValues(data, "countryCode"), [data])

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">Countries</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis dataKey="value" stroke="#71717a" />
          <YAxis stroke="#71717a" />
          <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }} />
          <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function ReviewsChart({ data }: { data: DataRow[] }) {
  const chartData = useMemo(() => {
    const vals = data
      .filter(row => typeof row.reviewsCount === "number")
      .map(row => ({ name: row.title as string, value: row.reviewsCount as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15)
    return vals
  }, [data])

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">Top by Reviews</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
          <YAxis stroke="#71717a" />
          <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }} />
          <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const stats = useMemo(() => {
    const fields = new Set<string>()
    const hasWebsite = data.filter(r => r.website).length
    const hasPhone = data.filter(r => r.phone).length
    const hasRating = data.filter(r => r.totalScore).length
    const avgRating = data.reduce((sum, r) => sum + (typeof r.totalScore === "number" ? r.totalScore : 0), 0) / hasRating || 0

    data.forEach(row => Object.keys(row).forEach(k => fields.add(k)))

    return {
      totalRows: data.length,
      totalFields: fields.size,
      hasWebsite,
      hasPhone,
      hasRating,
      avgRating: avgRating.toFixed(1),
      websitePct: ((hasWebsite / data.length) * 100).toFixed(1),
      phonePct: ((hasPhone / data.length) * 100).toFixed(1),
    }
  }, [data])

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
        <p className="text-zinc-400">Insights from your data</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Records" value={stats.totalRows} subtitle="entries in dataset" color="text-purple-400" />
        <StatCard title="Average Rating" value={stats.avgRating} subtitle="out of 5" color="text-yellow-400" />
        <StatCard title="With Website" value={`${stats.websitePct}%`} subtitle={`${stats.hasWebsite} of ${stats.totalRows}`} color="text-blue-400" />
        <StatCard title="With Phone" value={`${stats.phonePct}%`} subtitle={`${stats.hasPhone} of ${stats.totalRows}`} color="text-green-400" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CategoryChart data={data} />
        <CityChart data={data} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <RatingsChart data={data} />
        <CountryChart data={data} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <ReviewsChart data={data} />
      </div>
    </div>
  )
}