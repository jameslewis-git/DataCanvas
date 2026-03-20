"use client"

import { useMemo, useState, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Star, MapPin, Globe, Phone, ExternalLink, X } from "lucide-react"
import { formatNumber, truncate } from "@/lib/utils"
import { DataRow } from "@/lib/parser"

interface GridViewProps {
  data: DataRow[]
}

function getCardTitle(row: DataRow): string {
  return (row.title as string) || (row.name as string) || (row.title as string) || "Untitled"
}

function getCardSubtitle(row: DataRow): string {
  return (row.categoryName as string) || (row.category as string) || (row.type as string) || ""
}

function getCardDetails(row: DataRow): { icon: React.ReactNode; label: string; value: string }[] {
  const details: { icon: React.ReactNode; label: string; value: string }[] = []

  if (row.address) details.push({ icon: <MapPin className="w-4 h-4" />, label: "Address", value: row.address as string })
  if (row.website) details.push({ icon: <Globe className="w-4 h-4" />, label: "Website", value: row.website as string })
  if (row.phone) details.push({ icon: <Phone className="w-4 h-4" />, label: "Phone", value: row.phone as string })
  if (row.totalScore) details.push({ icon: <Star className="w-4 h-4" />, label: "Rating", value: String(row.totalScore) })

  return details.slice(0, 4)
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
            <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Boolean(row.totalScore) && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-yellow-500/10 rounded-full">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">{String(row.totalScore)}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {details.slice(0, 3).map((detail, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="text-zinc-600">{detail.icon}</span>
            <span className="truncate">{truncate(detail.value, 40)}</span>
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

  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220,
    overscan: 5,
  })

  const columns = 3

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