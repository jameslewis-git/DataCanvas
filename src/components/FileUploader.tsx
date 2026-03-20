"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
          metadata: {
            rowCount: fileData.length,
            columns: fileData.length > 0 ? Object.keys(fileData[0] || {}) : [],
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save file")
      }

      const savedFile = await response.json()
      setIsSaved(true)
      
      setTimeout(() => {
        router.push(`/dashboard/${savedFile.id}`)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save file")
    } finally {
      setIsSaving(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      processFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
      "text/csv": [".csv"],
    },
    multiple: false,
  })

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    setError(null)
    setFileData(null)
    setIsSaved(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer",
          isDragActive
            ? "border-purple-500 bg-purple-500/10"
            : "border-zinc-700 hover:border-zinc-600 bg-zinc-900/50",
          error && "border-red-500/50"
        )}
        {...getRootProps()}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-ping opacity-20" />
            </div>
            <p className="text-zinc-400">Processing your data...</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              {selectedFile.name.endsWith(".json") ? (
                <FileJson className="w-10 h-10 text-white" />
              ) : (
                <FileSpreadsheet className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <p className="text-white font-medium text-lg">{selectedFile.name}</p>
              <p className="text-zinc-400 text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                {fileData && ` • ${fileData.length} rows`}
              </p>
            </div>
            
            {session && fileData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                {isSaved ? (
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Saved! Opening...
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      saveToDatabase()
                    }}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Dashboard
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            )}
            
            {!session && (
              <p className="text-sm text-zinc-500">
                <a href="/auth/signin" className="text-purple-400 hover:underline">Sign in</a> to save your dashboard
              </p>
            )}

            <button
              onClick={clearFile}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
                isDragActive
                  ? "bg-gradient-to-br from-purple-500 to-pink-500 scale-110"
                  : "bg-zinc-800"
              )}
            >
              <Upload
                className={cn(
                  "w-10 h-10 transition-colors",
                  isDragActive ? "text-white" : "text-zinc-400"
                )}
              />
            </div>
            <div>
              <p className="text-white text-xl font-semibold">
                {isDragActive ? "Drop your file here" : "Drag & drop your file"}
              </p>
              <p className="text-zinc-400 mt-2">
                or click to browse JSON or CSV files
              </p>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <span className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700">
                .json
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700">
                .csv
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-red-400 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
