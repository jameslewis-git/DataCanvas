"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import { DataRow } from "@/lib/parser"
import { analyzeDataset } from "@/lib/analytics"
import { cn, formatNumber } from "@/lib/utils"

const COLORS = ["#a855f7", "#ec4899", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#6366f1"]

interface AnalyticsDashboardProps {
  data: DataRow[]
}

// Data-agnostic: count occurrences of each unique value for a given column
function getFieldCounts(data: DataRow[], field: string): { value: string; count: number }[] {
  const counts: Record<string, number> = {}
  data.forEach((row) => {
    const val = row[field]
    const key = val === null || val === undefined || val === "" ? "(empty)" : String(val)
    counts[key] = (counts[key] || 0) + 1
  })
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  // Sample 1000 rows for fast column-type analysis via analyzeDataset
  const sample = useMemo(() => data.slice(0, 1000), [data])
  const analysis = useMemo(() => analyzeDataset(sample), [sample])

  // Numeric columns that have computed statistics
  const numericCols = useMemo(
    () => analysis.columns.filter(c => c.type === "number" && c.statistics).slice(0, 4),
    [analysis]
  )

  // Categorical columns: string/category with reasonable cardinality for charting
  const categoryCols = useMemo(
    () =>
      analysis.columns
        .filter(c =>
          (c.type === "string" || c.type === "category") &&
          c.uniqueCount >= 2 &&
          c.uniqueCount <= 50
        )
        .slice(0, 4),
    [analysis]
  )

  // Full-data stats (rows, columns, null count)
  const stats = useMemo(() => {
    let nullCount = 0
    const fields = new Set<string>()
    data.forEach(row => {
      Object.entries(row).forEach(([k, v]) => {
        fields.add(k)
        if (v === null || v === undefined || v === "") nullCount++
      })
    })
    return { totalRows: data.length, totalFields: fields.size, nullCount }
  }, [data])

  // Area chart data: first numeric column over first 200 sample rows
  const firstNumericChart = useMemo(() => {
    const col = numericCols[0]
    if (!col) return []
    return sample.slice(0, 200).map((row, i) => ({
      index: i,
      value: typeof row[col.name] === "number" ? (row[col.name] as number) : 0,
    }))
  }, [sample, numericCols])

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h2>
        <p className="text-zinc-400 text-sm">
          Insights from {formatNumber(stats.totalRows)} records · {stats.totalFields} columns detected
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {([
          { label: "Total Records", value: formatNumber(stats.totalRows), color: "text-purple-400" },
          { label: "Total Columns", value: String(stats.totalFields), color: "text-blue-400" },
          { label: "Missing Values", value: formatNumber(stats.nullCount), color: "text-yellow-400" },
        ] as { label: string; value: string; color: string }[]).map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5"
          >
            <p className="text-zinc-400 text-sm mb-1">{s.label}</p>
            <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Per-column numeric stat cards: avg / min–max */}
      {numericCols.length > 0 && (
        <div
          className={cn(
            "grid gap-4",
            numericCols.length === 1 ? "grid-cols-1" :
            numericCols.length === 2 ? "grid-cols-2" :
            numericCols.length === 3 ? "grid-cols-3" : "grid-cols-4"
          )}
        >
          {numericCols.map((col, i) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
            >
              <p className="text-zinc-400 text-xs mb-1 truncate capitalize">{col.name}</p>
              <p className="text-2xl font-bold text-white">{col.statistics!.avg?.toLocaleString()}</p>
              <p className="text-zinc-500 text-xs mt-1">
                avg · {col.statistics!.min?.toLocaleString()} – {col.statistics!.max?.toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* First 2 categorical columns as horizontal bar charts */}
      {categoryCols.slice(0, 2).length > 0 && (
        <div className={cn("grid gap-4", categoryCols.slice(0, 2).length === 1 ? "grid-cols-1" : "grid-cols-2")}>
          {categoryCols.slice(0, 2).map((col) => {
            const chartData = getFieldCounts(data.slice(0, 5000), col.name)
            return (
              <div key={col.name} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4 capitalize">{col.name} Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis type="number" stroke="#71717a" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="value" type="category" stroke="#71717a" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }} />
                    <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      )}

      {/* Next 2 categorical columns as pie charts */}
      {categoryCols.slice(2, 4).length > 0 && (
        <div className={cn("grid gap-4", categoryCols.slice(2, 4).length === 1 ? "grid-cols-1" : "grid-cols-2")}>
          {categoryCols.slice(2, 4).map((col) => {
            const chartData = getFieldCounts(data.slice(0, 5000), col.name)
            return (
              <div key={col.name} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4 capitalize">{col.name} Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="count"
                      nameKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
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
          })}
        </div>
      )}

      {/* First numeric column area trend chart (200-row sample) */}
      {numericCols[0] && firstNumericChart.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 capitalize">
            {numericCols[0].name} — Sample Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={firstNumericChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="index" stroke="#71717a" tick={{ fontSize: 11 }} />
              <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Auto-generated insights from column analysis */}
      {analysis.insights.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Dataset Insights</h3>
          <ul className="space-y-2">
            {analysis.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                <span className="text-purple-400 mt-0.5">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}