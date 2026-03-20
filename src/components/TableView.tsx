"use client"

import { useMemo, useState, useRef } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpDown, Search, Filter, ChevronDown, ChevronRight } from "lucide-react"
import { cn, formatNumber, truncate } from "@/lib/utils"
import { DataRow } from "@/lib/parser"

interface TableViewProps {
  data: DataRow[]
  onRowClick?: (row: DataRow) => void
}

const columnHelper = createColumnHelper<DataRow>()

export function TableView({ data, onRowClick }: TableViewProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const columns = useMemo(() => {
    if (data.length === 0) return []

    const firstRow = data[0]
    if (!firstRow) return []

    const keys = Object.keys(firstRow)

    return keys.slice(0, 10).map((key) =>
      columnHelper.accessor(key, {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            {key}
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => {
          const value = info.getValue()
          if (value === null || value === undefined) return <span className="text-zinc-600">-</span>
          if (typeof value === "object") return <span className="text-zinc-500">{JSON.stringify(value)}</span>
          if (typeof value === "string" && value.length > 50) return truncate(value, 50)
          return String(value)
        },
        size: 150,
      })
    )
  }, [data])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const { rows } = table.getRowModel()

  const parentRef = useRef<HTMLDivElement | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  })

  const toggleRowExpansion = (index: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4 border-b border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Filter className="w-5 h-5" />
          <span>{formatNumber(rows.length)} rows</span>
        </div>
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-zinc-950">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th className="w-10 p-2"></th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 text-left text-sm font-semibold text-zinc-300 border-b border-zinc-800"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              if (!row) return null
              
              const isExpanded = expandedRows.has(virtualRow.index)

              return (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "hover:bg-zinc-900/50 transition-colors cursor-pointer",
                    virtualRow.index % 2 === 0 ? "bg-zinc-950/30" : "bg-zinc-950/10"
                  )}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                  }}
                >
                  <td className="p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleRowExpansion(virtualRow.index)
                      }}
                      className="p-1 hover:bg-zinc-800 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      )}
                    </button>
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-3 text-sm text-zinc-300 border-b border-zinc-800/50"
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              )
            })}
          </tbody>
        </table>

        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        />
      </div>

      <AnimatePresence>
        {expandedRows.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-800 bg-zinc-900/30 p-4"
          >
            <p className="text-zinc-400 text-sm mb-2">Expanded Details</p>
            <pre className="text-xs text-zinc-300 overflow-auto max-h-48">
              {JSON.stringify(
                data.filter((_, i) => expandedRows.has(i)),
                null,
                2
              )}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}