"use client"

import { useState, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutGrid, Table, List, FileJson, FileSpreadsheet, X, BarChart3, Save, Check, Loader2, Search } from "lucide-react"
import { useVirtualizer } from "@tanstack/react-virtual"
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
  const [search, setSearch] = useState("")
  const parentRef = useRef<HTMLDivElement>(null)

  // Data-agnostic helpers: use positional string fields rather than hardcoded names
  const getStrEntries = (row: DataRow) =>
    Object.entries(row).filter(([, v]) => typeof v === "string" && String(v).trim().length > 0)
  const getTitle = (row: DataRow) => { const e = getStrEntries(row); return e[0] ? String(e[0][1]) : "Row" }
  const getSubtitle = (row: DataRow) => { const e = getStrEntries(row); return e[1] ? String(e[1][1]) : "" }
  const getDescription = (row: DataRow) => { const e = getStrEntries(row); return e[2] ? String(e[2][1]) : "" }

  const filteredData = useMemo(() => {
    if (!search) return data
    const s = search.toLowerCase()
    return data.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(s)))
  }, [data, search])

  // Virtualize: only render rows visible in the viewport
  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 84,
    overscan: 10,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4 border-b border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search list..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <span className="text-zinc-500 text-sm">{filteredData.length.toLocaleString()} results</span>
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto p-4">
        <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = filteredData[virtualRow.index]
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                  paddingBottom: "8px",
                }}
              >
                <div className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-purple-500/30 hover:bg-zinc-900 transition-all cursor-pointer h-full">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-bold text-sm">{virtualRow.index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{getTitle(row)}</h4>
                    <p className="text-sm text-zinc-400 truncate">{getSubtitle(row)}</p>
                    {getDescription(row) && (
                      <p className="text-sm text-zinc-500 truncate mt-0.5">{getDescription(row)}</p>
                    )}
                  </div>
                  {Object.entries(row).find(([, v]) => typeof v === "number") && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/10 rounded-full flex-shrink-0">
                      <span className="text-purple-400 text-sm font-medium">
                        {String(Object.entries(row).find(([, v]) => typeof v === "number")?.[1] ?? "")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
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