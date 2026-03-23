"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutGrid, Table, List, FileJson, FileSpreadsheet, X, BarChart3, Save, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { DataRow, exportToJson, exportToCsv } from "@/lib/parser"
import { TableView } from "@/components/TableView"
import { GridView } from "@/components/GridView"
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard"

type ViewMode = "table" | "grid" | "list" | "analytics"

interface DataViewerProps {
  data: DataRow[]
  filename: string
  onClear: () => void
  onSave?: () => Promise<void>
  isSaved?: boolean
}

function ListView({ data }: { data: DataRow[] }) {
  const getTitle = (row: DataRow) => row.title as string || row.name as string || "Untitled"
  const getSubtitle = (row: DataRow) => row.categoryName as string || row.category as string || ""
  const getDescription = (row: DataRow) => row.address as string || row.description as string || ""

  return (
    <div className="flex flex-col h-full overflow-auto p-4 space-y-2">
      {data.map((row, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.01 }}
          className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-purple-500/30 hover:bg-zinc-900 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <span className="text-purple-400 font-bold">{i + 1}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white truncate">{getTitle(row)}</h4>
            <p className="text-sm text-zinc-400 truncate">{getSubtitle(row)}</p>
            <p className="text-sm text-zinc-500 truncate mt-1">{getDescription(row)}</p>
          </div>
          {Boolean(row.totalScore) && (
            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/10 rounded-full">
              <span className="text-yellow-500 text-sm font-medium">{String(row.totalScore)}</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function StatsBar({ data }: { data: DataRow[] }) {
  const stats = useMemo(() => {
    const fields = new Set<string>()
    let nullCount = 0

    data.forEach((row) => {
      Object.values(row).forEach((val) => {
        if (val === null || val === undefined) nullCount++
      })
      Object.keys(row).forEach((k) => fields.add(k))
    })

    return {
      totalRows: data.length,
      totalFields: fields.size,
      nullValues: nullCount,
    }
  }, [data])

  return (
    <div className="grid grid-cols-3 gap-4 p-4 border-b border-zinc-800">
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <div className="text-2xl font-bold text-white">{stats.totalRows.toLocaleString()}</div>
        <div className="text-sm text-zinc-400">Total Rows</div>
      </div>
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <div className="text-2xl font-bold text-white">{stats.totalFields}</div>
        <div className="text-sm text-zinc-400">Columns</div>
      </div>
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <div className="text-2xl font-bold text-white">{stats.nullValues.toLocaleString()}</div>
        <div className="text-sm text-zinc-400">Empty Values</div>
      </div>
    </div>
  )
}

export function DataViewer({ data, filename, onClear, onSave, isSaved }: DataViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!onSave || saving || isSaved) return
    setSaving(true)
    try {
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  const handleExportJson = () => {
    const json = exportToJson(data)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename.replace(/\.[^/.]+$/, "") + "_export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCsv = () => {
    const csv = exportToCsv(data)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename.replace(/\.[^/.]+$/, "") + "_export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const viewButtons: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: "table", icon: <Table className="w-5 h-5" />, label: "Table" },
    { mode: "grid", icon: <LayoutGrid className="w-5 h-5" />, label: "Grid" },
    { mode: "list", icon: <List className="w-5 h-5" />, label: "List" },
    { mode: "analytics", icon: <BarChart3 className="w-5 h-5" />, label: "Analytics" },
  ]

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">{filename}</h2>
            <p className="text-sm text-zinc-400">{data.length.toLocaleString()} records</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
          {viewButtons.map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                viewMode === mode
                  ? "bg-purple-500 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={handleSave}
              disabled={saving || isSaved}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isSaved
                  ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
                  : "bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
              )}
            >
              {isSaved ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save to Dashboard</>
              )}
            </button>
          )}
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={onClear}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </div>

      <StatsBar data={data} />

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {viewMode === "table" && <TableView data={data} />}
            {viewMode === "grid" && <GridView data={data} />}
            {viewMode === "list" && <ListView data={data} />}
            {viewMode === "analytics" && <AnalyticsDashboard data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}