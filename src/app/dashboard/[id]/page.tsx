"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Database, 
  ArrowLeft, 
  BarChart3,
  LineChart,
  PieChart,
  LayoutGrid,
  Sparkles
} from "lucide-react"
import { DataRow } from "@/lib/parser"
import { analyzeDataset, VisualizationSuggestion, ChartType } from "@/lib/analytics"
import { 
  BarChartWidget, LineChartWidget, PieChartWidget, DonutChartWidget, 
  AreaChartWidget, ScatterChartWidget, GaugeChartWidget,
  RadarChartWidget, TreemapChartWidget, FunnelChartWidget, HeatmapChartWidget
} from "@/components/charts"
import { ExportMenu } from "@/components/ExportMenu"
import { exportToPng, exportToPdf, exportToCsv, exportToJson } from "@/lib/export"

interface DashboardFile {
  id: string
  name: string
  size: number
  type: string
  data: DataRow[]
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

type ViewMode = "auto" | "table" | "grid" | "chart"

function VisualizationCard({ 
  suggestion, 
  onSelect 
}: { 
  suggestion: VisualizationSuggestion
  onSelect: () => void
}) {
  const chartIconMap: Record<ChartType, React.ReactNode> = {
    bar: <BarChart3 className="w-6 h-6" />,
    line: <LineChart className="w-6 h-6" />,
    pie: <PieChart className="w-6 h-6" />,
    donut: <PieChart className="w-6 h-6" />,
    area: <LineChart className="w-6 h-6" />,
    scatter: <BarChart3 className="w-6 h-6" />,
    gauge: <BarChart3 className="w-6 h-6" />,
    radar: <BarChart3 className="w-6 h-6" />,
    heatmap: <LayoutGrid className="w-6 h-6" />,
    treemap: <LayoutGrid className="w-6 h-6" />,
    funnel: <BarChart3 className="w-6 h-6" />,
    bubble: <BarChart3 className="w-6 h-6" />,
  }
  const chartIcon = chartIconMap[suggestion.type] || <BarChart3 className="w-6 h-6" />

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-purple-500/50 transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400">
          {chartIcon}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-white">{suggestion.title}</h4>
          <p className="text-xs text-zinc-400 capitalize">{suggestion.type}</p>
        </div>
      </div>
      <p className="text-sm text-zinc-400 mb-3">{suggestion.description}</p>
      <p className="text-xs text-purple-400">{suggestion.reason}</p>
    </motion.div>
  )
}

function DataChart({ 
  type, 
  data, 
  columns 
}: { 
  type: ChartType
  data: DataRow[]
  columns: string[]
}) {
  const xKey = columns[0] ?? "key"
  const yKey = columns[1] ?? columns[0] ?? "value"
  const nameKey = columns[0] ?? "name"
  const valueKey = columns[1] ?? columns[0] ?? "value"

  switch (type) {
    case "bar":
      return <BarChartWidget data={data} xKey={xKey} yKey={yKey} />
    case "line":
      return <LineChartWidget data={data} xKey={xKey} yKey={yKey} />
    case "area":
      return <AreaChartWidget data={data} xKey={xKey} yKey={yKey} />
    case "pie":
      return <PieChartWidget data={data} nameKey={nameKey} valueKey={valueKey} />
    case "donut":
      return <DonutChartWidget data={data} nameKey={nameKey} valueKey={valueKey} />
    case "scatter":
      return <ScatterChartWidget data={data} xKey={xKey} yKey={yKey} />
    case "gauge":
      const avgValue = data.reduce((acc, row) => acc + (Number(row[yKey]) || 0), 0) / data.length
      return <GaugeChartWidget value={avgValue} />
    case "radar":
      return <RadarChartWidget data={data} xKey={xKey} yKey={yKey} />
    case "treemap":
      return <TreemapChartWidget data={data} xKey={xKey} yKey={yKey} />
    case "funnel":
      return <FunnelChartWidget data={data} xKey={xKey} yKey={yKey} />
    case "heatmap":
      const thirdKey = columns[2] ?? yKey
      return <HeatmapChartWidget data={data} xKey={xKey} yKey={yKey} valueKey={thirdKey} />
    default:
      return <BarChartWidget data={data} xKey={xKey} yKey={yKey} />
  }
}

interface HeaderProps {
  onExportPng: () => Promise<void>
  onExportPdf: () => Promise<void>
  onExportCsv: () => void
  onExportJson: () => void
}

function Header({ onExportPng, onExportPdf, onExportCsv, onExportJson }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <ArrowLeft className="w-5 h-5 text-zinc-400 hover:text-white transition-colors" />
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            DataCanvas
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ExportMenu 
            onExportPng={onExportPng}
            onExportPdf={onExportPdf}
            onExportCsv={onExportCsv}
            onExportJson={onExportJson}
          />
        </div>
      </div>
    </header>
  )
}

function StatsBar({ analysis }: { analysis: ReturnType<typeof analyzeDataset> }) {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-zinc-900/50 border-b border-zinc-800">
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <div className="text-2xl font-bold text-white">{analysis.rowCount.toLocaleString()}</div>
        <div className="text-sm text-zinc-400">Total Rows</div>
      </div>
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <div className="text-2xl font-bold text-white">{analysis.columnCount}</div>
        <div className="text-sm text-zinc-400">Columns</div>
      </div>
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <div className="text-2xl font-bold text-white">{analysis.suggestedVisualizations.length}</div>
        <div className="text-sm text-zinc-400">Suggested Charts</div>
      </div>
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <div className="text-2xl font-bold text-white">{analysis.columns.filter(c => c.type === "number").length}</div>
        <div className="text-sm text-zinc-400">Numeric Columns</div>
      </div>
    </div>
  )
}

export default function DashboardViewPage() {
  const params = useParams()
  const router = useRouter()
  useSession()
  const [file, setFile] = useState<DashboardFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("auto")
  const [selectedChart, setSelectedChart] = useState<VisualizationSuggestion | null>(null)

  useEffect(() => {
    fetchFile()
  }, [params.id])

  async function fetchFile() {
    try {
      setLoading(true)
      const response = await fetch(`/api/files/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/signin")
          return
        }
        if (response.status === 404) {
          setError("Dashboard not found")
          return
        }
        throw new Error("Failed to load dashboard")
      }
      
      const data = await response.json()
      setFile(data)
      
      if (data.data && data.data.length > 0) {
        const analysis = analyzeDataset(data.data)
        const firstChart = analysis.suggestedVisualizations[0]
        if (firstChart) {
          setSelectedChart(firstChart)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const analysis = useMemo(() => {
    if (!file?.data) return null
    return analyzeDataset(file.data)
  }, [file?.data])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Dashboard not found"}</p>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const handleExportPng = async () => {
    const name = file.name.replace(/\.[^/.]+$/, "")
    await exportToPng("dashboard-content", name)
  }

  const handleExportPdf = async () => {
    const name = file.name.replace(/\.[^/.]+$/, "")
    await exportToPdf("dashboard-content", name)
  }

  const handleExportCsv = () => {
    if (file.data) {
      const name = file.name.replace(/\.[^/.]+$/, "")
      exportToCsv(file.data, name)
    }
  }

  const handleExportJson = () => {
    if (file.data) {
      const name = file.name.replace(/\.[^/.]+$/, "")
      exportToJson(file.data, name)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header 
        onExportPng={handleExportPng}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
      />

      <div id="dashboard-content" className="border-b border-zinc-800 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{file.name}</h1>
            <p className="text-sm text-zinc-400">
              {file.data?.length || 0} rows
            </p>
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-zinc-800 rounded-xl">
            {(["auto", "table", "chart"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  viewMode === mode
                    ? "bg-purple-500 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {mode === "auto" && <Sparkles className="w-4 h-4" />}
                {mode === "table" && <LayoutGrid className="w-4 h-4" />}
                {mode === "chart" && <BarChart3 className="w-4 h-4" />}
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {analysis && <StatsBar analysis={analysis} />}

      {viewMode === "auto" && analysis && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-semibold text-white mb-4">Suggested Visualizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {analysis.suggestedVisualizations.map((suggestion, index) => (
              <VisualizationCard
                key={index}
                suggestion={suggestion}
                onSelect={() => setSelectedChart(suggestion)}
              />
            ))}
          </div>

          {selectedChart && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">{selectedChart.title}</h3>
              <div className="h-[400px]">
                <DataChart 
                  type={selectedChart.type} 
                  data={file.data} 
                  columns={selectedChart.columns} 
                />
              </div>
            </motion.div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Data Insights</h3>
            <div className="space-y-2">
              {analysis.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                  <p className="text-sm text-zinc-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Column Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.columns.slice(0, 9).map((col) => (
                <div key={col.name} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white truncate">{col.name}</h4>
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full capitalize">
                      {col.type}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-zinc-400">
                    <p>Total: {col.totalCount}</p>
                    <p>Unique: {col.uniqueCount}</p>
                    {col.nullCount > 0 && <p className="text-yellow-500">Null: {col.nullCount}</p>}
                    {col.statistics && (
                      <>
                        <p>Min: {col.statistics.min}</p>
                        <p>Max: {col.statistics.max}</p>
                        <p>Avg: {col.statistics.avg}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === "table" && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900">
                  <tr>
                    {file.data.length > 0 && Object.keys(file.data[0] ?? {}).map((key) => (
                      <th key={key} className="px-4 py-3 text-left text-sm font-semibold text-zinc-300 border-b border-zinc-800">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {file.data.slice(0, 100).map((row, index) => (
                    <tr key={index} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="px-4 py-3 text-sm text-zinc-300">
                          {typeof value === "object" ? JSON.stringify(value) : String(value ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {file.data.length > 100 && (
              <div className="p-4 text-center text-sm text-zinc-400 border-t border-zinc-800">
                Showing 100 of {file.data.length} rows
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === "chart" && selectedChart && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 h-[600px]">
            <DataChart 
              type={selectedChart.type} 
              data={file.data} 
              columns={selectedChart.columns} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
