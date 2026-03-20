"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, FileImage, FileText, FileJson, ChevronDown, Loader2 } from "lucide-react"

interface ExportMenuProps {
  onExportPng: () => Promise<void>
  onExportPdf: () => Promise<void>
  onExportCsv: () => void
  onExportJson: () => void
}

export function ExportMenu({ onExportPng, onExportPdf, onExportCsv, onExportJson }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

  const handleExport = async (type: string, fn: () => Promise<void> | void) => {
    setExporting(type)
    try {
      await fn()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setExporting(null)
      setIsOpen(false)
    }
  }

  const menuItems = [
    {
      id: "png",
      label: "PNG Image",
      description: "High quality image",
      icon: <FileImage className="w-4 h-4" />,
      action: () => handleExport("png", onExportPng),
    },
    {
      id: "pdf",
      label: "PDF Document",
      description: "For printing or sharing",
      icon: <FileText className="w-4 h-4" />,
      action: () => handleExport("pdf", onExportPdf),
    },
    {
      id: "csv",
      label: "CSV Data",
      description: "Raw data in spreadsheet format",
      icon: <FileText className="w-4 h-4" />,
      action: () => handleExport("csv", onExportCsv),
    },
    {
      id: "json",
      label: "JSON Data",
      description: "Raw data in JSON format",
      icon: <FileJson className="w-4 h-4" />,
      action: () => handleExport("json", onExportJson),
    },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-64 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50"
            >
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  disabled={exporting !== null}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                    {exporting === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      item.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{item.label}</div>
                    <div className="text-xs text-zinc-400">{item.description}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
