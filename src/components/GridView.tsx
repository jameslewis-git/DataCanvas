"use client"

import { useMemo, useState, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ExternalLink, X } from "lucide-react"
import { formatNumber, truncate } from "@/lib/utils"
import { DataRow } from "@/lib/parser"

interface GridViewProps {
  data: DataRow[]
}

// Returns the first non-empty string value in the row as the card title (data-agnostic)
function getCardTitle(row: DataRow): string {
  const strEntry = Object.entries(row).find(([, v]) => typeof v === "string" && String(v).trim().length > 0)
  if (strEntry) return String(strEntry[1])
  const numEntry = Object.entries(row).find(([, v]) => typeof v === "number")
  return numEntry ? String(numEntry[1]) : "Row"
}

// Returns the second non-empty string value as a subtitle (data-agnostic)
function getCardSubtitle(row: DataRow): string {
  const strEntries = Object.entries(row).filter(([, v]) => typeof v === "string" && String(v).trim().length > 0)
  return strEntries[1] ? String(strEntries[1][1]) : ""
}

// Returns remaining fields as label/value pairs for the card body (data-agnostic)
function getCardDetails(row: DataRow): { label: string; value: string }[] {
  const strEntries = Object.entries(row).filter(([, v]) => typeof v === "string" && String(v).trim().length > 0)
  const titleKey = strEntries[0]?.[0]
  const subtitleKey = strEntries[1]?.[0]
  return Object.entries(row)
    .filter(([k]) => k !== titleKey && k !== subtitleKey)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .slice(0, 4)
    .map(([k, v]) => ({ label: k, value: String(v) }))
}

function Card({ row, onClick }: { row: DataRow; onClick: () => void }) {
  const title = getCardTitle(row)
  const subtitle = getCardSubtitle(row)
  const details = getCardDetails(row)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className="group relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5 cursor-pointer hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-zinc-400 mt-1 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {details.slice(0, 3).map((detail, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500 text-xs font-medium capitalize min-w-[60px] truncate">{detail.label}:</span>
            <span className="text-zinc-300 truncate">{truncate(detail.value, 35)}</span>
          </div>
        ))}
      </div>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-5 h-5 text-purple-400" />
      </div>
    </motion.div>
  )
}

function DetailModal({ row, onClose }: { row: DataRow; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{getCardTitle(row)}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(row).map(([key, value]) => (
            <div key={key} className="flex gap-4">
              <span className="text-zinc-500 min-w-[120px] capitalize">{key}</span>
              <span className="text-zinc-300 flex-1 break-all">
                {typeof value === "object" ? JSON.stringify(value) : String(value ?? "-")}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export function GridView({ data }: GridViewProps) {
  const [search, setSearch] = useState("")
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  const filteredData = useMemo(() => {
    if (!search) return data
    const searchLower = search.toLowerCase()
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchLower)
      )
    )
  }, [data, search])

  const columns = 3

  // FIX: count must be number of virtual rows (each row holds `columns` cards), not total items
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(filteredData.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220,
    overscan: 5,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4 border-b border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="text-zinc-400 text-sm">
          {formatNumber(filteredData.length)} cards
        </div>
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto p-4">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * columns
            const rowItems = filteredData.slice(startIndex, startIndex + columns)

            return (
              <div
                key={virtualRow.index}
                className="grid grid-cols-3 gap-4 absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  height: `${virtualRow.size}px`,
                }}
              >
                {rowItems.map((item, i) => (
                  <Card
                    key={startIndex + i}
                    row={item}
                    onClick={() => setSelectedRow(item)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedRow && (
          <DetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}