"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Database, Sparkles } from "lucide-react"
import { FileUploader } from "@/components/FileUploader"
import { DataViewer } from "@/components/DataViewer"
import { DataRow } from "@/lib/parser"

export default function Home() {
  const [data, setData] = useState<DataRow[]>([])
  const [filename, setFilename] = useState("")

  const handleDataLoaded = (loadedData: DataRow[], loadedFilename: string) => {
    setData(loadedData)
    setFilename(loadedFilename)
  }

  const handleClear = () => {
    setData([])
    setFilename("") 
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-zinc-950 to-zinc-950" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNC0xNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-30" />

      <div className="relative">
        <header className="flex items-center justify-between p-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              DataLens
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-zinc-400">Supports JSON & CSV</span>
          </div>
        </header>

        <main className="p-6">
          <AnimatePresence mode="wait">
            {data.length === 0 ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center min-h-[70vh]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Visualize Your Data
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {" "}Beautifully
                    </span>
                  </h1>
                  <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                    Upload JSON or CSV files to explore, filter, and visualize your data with an amazing UI
                  </p>
                </motion.div>

                <FileUploader onDataLoaded={handleDataLoaded} />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-12 flex flex-wrap justify-center gap-6 text-zinc-500"
                >
                  {[
                    "Virtualized Tables",
                    "Beautiful Cards",
                    "Search & Filter",
                    "Export Options",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800"
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      {feature}
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="viewer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[calc(100vh-100px)]"
              >
                <DataViewer
                  data={data}
                  filename={filename}
                  onClear={handleClear}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}