"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileJson, FileSpreadsheet, X, Loader2, Save, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseJsonFile, parseCsvFile, DataRow } from "@/lib/parser"

interface FileUploaderProps {
  onDataLoaded: (data: DataRow[], filename: string) => void
}

export function FileUploader({ onDataLoaded }: FileUploaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileData, setFileData] = useState<DataRow[] | null>(null)

  const processFile = async (file: File) => {
    setIsLoading(true)
    setError(null)
    setSelectedFile(file)
    setIsSaved(false)

    try {
      const ext = file.name.split(".").pop()?.toLowerCase()
      let data: DataRow[]

      if (ext === "json") {
        data = await parseJsonFile(file)
      } else if (ext === "csv") {
        data = await parseCsvFile(file)
      } else {
        throw new Error("Unsupported file type. Please use JSON or CSV.")
      }

      setFileData(data)
      onDataLoaded(data, file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file")
      setSelectedFile(null)
      setFileData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const saveToDatabase = async () => {
    if (!session || !selectedFile || !fileData) return
    setIsSaving(true)
    try {
      const response = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.name.endsWith(".json") ? "application/json" : "text/csv",
          data: fileData,
          metadata: { rowCount: fileData.length, columns: fileData.length > 0 ? Object.keys(fileData[0] || {}) : [] },
        }),
      })
      if (!response.ok) throw new Error("Failed to save file")
      const savedFile = await response.json()
      setIsSaved(true)
      setTimeout(() => router.push(`/dashboard/${savedFile.id}`), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save file")
    } finally {
      setIsSaving(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) processFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"], "text/csv": [".csv"] },
    multiple: false,
  })

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    setError(null)
    setFileData(null)
    setIsSaved(false)
  }

  const fileType = selectedFile?.name.endsWith(".json") ? "json" : "csv"

  return (
    <div className="w-full">
      <div
        {...getRootProps() as any}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer",
          isDragActive ? "border-purple-500 bg-purple-500/10 scale-[1.02]" : "border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10",
          error && "border-red-500/50",
          selectedFile && "border-emerald-500/30 bg-emerald-500/5"
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 animate-ping opacity-30" />
              </div>
              <p className="text-zinc-300">Processing your data...</p>
            </motion.div>
          ) : selectedFile ? (
            <motion.div key="selected" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", fileType === "json" ? "bg-gradient-to-br from-purple-500 to-indigo-500" : "bg-gradient-to-br from-emerald-500 to-teal-500")}>
                {fileType === "json" ? <FileJson className="w-8 h-8 text-white" /> : <FileSpreadsheet className="w-8 h-8 text-white" />}
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{selectedFile.name}</p>
                <p className="text-zinc-400 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB {fileData && `• ${fileData.length.toLocaleString()} rows`}</p>
              </div>
              {session && fileData && (
                isSaved ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl">
                    <Check className="w-4 h-4" /> Saved!
                  </div>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); saveToDatabase() }} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors">
                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Dashboard</>}
                  </button>
                )
              )}
              <button onClick={clearFile} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
              <motion.div animate={{ scale: isDragActive ? 1.1 : 1 }} className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all", isDragActive ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30" : "bg-white/10")}>
                <Upload className={cn("w-8 h-8", isDragActive ? "text-white" : "text-zinc-400")} />
              </motion.div>
              <div>
                <p className="text-white font-semibold text-lg">{isDragActive ? "Drop your file here" : "Drop your JSON or CSV file"}</p>
                <p className="text-zinc-500 text-sm mt-1">or click to browse</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
          {error}
        </motion.div>
      )}
    </div>
  )
}