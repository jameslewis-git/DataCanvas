import { DataRow } from "../parser"

export type DataType = 
  | "number"
  | "string"
  | "boolean"
  | "date"
  | "email"
  | "url"
  | "phone"
  | "currency"
  | "percentage"
  | "location"
  | "category"
  | "json"
  | "array"
  | "unknown"

export interface ColumnAnalysis {
  name: string
  type: DataType
  sampleValues: unknown[]
  totalCount: number
  nullCount: number
  uniqueCount: number
  statistics?: {
    min?: number
    max?: number
    avg?: number
    sum?: number
    median?: number
  }
  patterns?: {
    email: number
    url: number
    phone: number
    currency: number
    percentage: number
    date: number
  }
}

export interface DatasetAnalysis {
  rowCount: number
  columnCount: number
  columns: ColumnAnalysis[]
  suggestedVisualizations: VisualizationSuggestion[]
  insights: string[]
}

export interface VisualizationSuggestion {
  type: ChartType
  title: string
  description: string
  columns: string[]
  reason: string
}

export type ChartType =
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "donut"
  | "scatter"
  | "radar"
  | "heatmap"
  | "treemap"
  | "funnel"
  | "gauge"
  | "bubble"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
const CURRENCY_REGEX = /^[$€£¥₹]?\s?[\d,]+\.?\d*$/
const PERCENTAGE_REGEX = /^[\d.]+\s?%$/
const DATE_REGEX = /^\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}$|^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/

function detectDataType(value: unknown): DataType {
  if (value === null || value === undefined || value === "") return "unknown"
  
  const strValue = String(value).trim()
  
  if (strValue === "true" || strValue === "false") return "boolean"
  if (!isNaN(Number(strValue)) && strValue !== "") return "number"
  if (EMAIL_REGEX.test(strValue)) return "email"
  if (URL_REGEX.test(strValue)) return "url"
  if (PHONE_REGEX.test(strValue)) return "phone"
  if (CURRENCY_REGEX.test(strValue)) return "currency"
  if (PERCENTAGE_REGEX.test(strValue)) return "percentage"
  if (DATE_REGEX.test(strValue)) return "date"
  
  try {
    const parsed = JSON.parse(strValue)
    if (Array.isArray(parsed)) return "array"
    if (typeof parsed === "object") return "json"
  } catch {
    if (strValue.length < 50 && (strValue.includes(",") || strValue.includes("|"))) return "category"
  }
  
  return "string"
}

function calculateStatistics(values: number[]): ColumnAnalysis["statistics"] {
  if (values.length === 0) return undefined
  
  const sorted = [...values].sort((a, b) => a - b)
  const sum = values.reduce((a, b) => a + b, 0)
  const avg = sum / values.length
  
  let median = 0
  const midIndex = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    const left = sorted[midIndex - 1] ?? 0
    const right = sorted[midIndex] ?? 0
    median = (left + right) / 2
  } else {
    median = sorted[midIndex] ?? 0
  }
  
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: Math.round(avg * 100) / 100,
    sum: Math.round(sum * 100) / 100,
    median: Math.round(median * 100) / 100,
  }
}

export function analyzeColumn(name: string, values: unknown[]): ColumnAnalysis {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== "")
  const typeCounts: Record<DataType, number> = {
    number: 0, string: 0, boolean: 0, date: 0, email: 0, url: 0,
    phone: 0, currency: 0, percentage: 0, location: 0, category: 0, json: 0, array: 0, unknown: 0
  }
  
  const uniqueValues = new Set<unknown>()
  const numericValues: number[] = []
  const patterns = { email: 0, url: 0, phone: 0, currency: 0, percentage: 0, date: 0 }
  
  nonNullValues.forEach((value) => {
    const type = detectDataType(value)
    typeCounts[type]++
    uniqueValues.add(value)
    
    if (type === "number") numericValues.push(Number(value))
    
    if (EMAIL_REGEX.test(String(value))) patterns.email++
    if (URL_REGEX.test(String(value))) patterns.url++
    if (PHONE_REGEX.test(String(value))) patterns.phone++
    if (CURRENCY_REGEX.test(String(value))) patterns.currency++
    if (PERCENTAGE_REGEX.test(String(value))) patterns.percentage++
    if (DATE_REGEX.test(String(value))) patterns.date++
  })
  
  const dominantType = Object.entries(typeCounts)
    .filter(([key]) => key !== "unknown")
    .sort((a, b) => b[1] - a[1])[0]?.[0] as DataType || "string"
  
  const sampleValues = nonNullValues.slice(0, 5)
  
  return {
    name,
    type: dominantType,
    sampleValues,
    totalCount: values.length,
    nullCount: values.length - nonNullValues.length,
    uniqueCount: uniqueValues.size,
    statistics: numericValues.length > 0 ? calculateStatistics(numericValues) : undefined,
    patterns: patterns.email > 0 || patterns.url > 0 || patterns.phone > 0 ? patterns : undefined,
  }
}

export function analyzeDataset(data: DataRow[]): DatasetAnalysis {
  if (data.length === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      columns: [],
      suggestedVisualizations: [],
      insights: [],
    }
  }
  
  const columns = Object.keys(data[0] ?? {})
  const columnData = columns.map(name => ({
    name,
    values: data.map(row => row[name])
  }))
  
  const analyzedColumns = columnData.map(col => analyzeColumn(col.name, col.values))
  const suggestions = suggestVisualizations(analyzedColumns)
  const insights = generateInsights(analyzedColumns)
  
  return {
    rowCount: data.length,
    columnCount: columns.length,
    columns: analyzedColumns,
    suggestedVisualizations: suggestions,
    insights,
  }
}

function suggestVisualizations(columns: ColumnAnalysis[]): VisualizationSuggestion[] {
  const suggestions: VisualizationSuggestion[] = []
  
  const numericColumns = columns.filter(c => c.type === "number" || c.type === "currency" || c.type === "percentage")
  const categoryColumns = columns.filter(c => c.type === "category" || c.type === "string")
  const dateColumns = columns.filter(c => c.type === "date")
  
  numericColumns.forEach(col => {
    if (col.statistics && col.statistics.avg !== undefined) {
      suggestions.push({
        type: "gauge",
        title: `${col.name} Overview`,
        description: "Shows current value compared to min/max range",
        columns: [col.name],
        reason: `Numeric metric with avg of ${col.statistics.avg}`,
      })
    }
  })
  
  if (categoryColumns.length > 0 && numericColumns.length > 0) {
    const catCol = categoryColumns[0]
    const numCol = numericColumns[0]
    
    if (catCol && numCol) {
      suggestions.push({
        type: "bar",
        title: `${numCol.name} by ${catCol.name}`,
        description: "Compare values across categories",
        columns: [catCol.name, numCol.name],
        reason: "Best for comparing categories",
      })
      
      suggestions.push({
        type: "pie",
        title: `${numCol.name} Distribution`,
        description: "Show composition of categories",
        columns: [catCol.name, numCol.name],
        reason: "Best for showing parts of a whole",
      })
      
      suggestions.push({
        type: "donut",
        title: `${numCol.name} Breakdown`,
        description: "Alternative to pie chart",
        columns: [catCol.name, numCol.name],
        reason: "Cleaner visualization of proportions",
      })
    }
  }
  
  if (numericColumns.length >= 2) {
    const firstNumCol = numericColumns[0]
    const secondNumCol = numericColumns[1]
    if (firstNumCol && secondNumCol) {
      suggestions.push({
        type: "scatter",
        title: `${firstNumCol.name} vs ${secondNumCol.name}`,
        description: "Find correlations between metrics",
        columns: [firstNumCol.name, secondNumCol.name],
        reason: "Reveals relationships between numeric values",
      })
    }
  }
  
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    const firstDateCol = dateColumns[0]
    const firstNumCol = numericColumns[0]
    if (firstDateCol && firstNumCol) {
      suggestions.push({
        type: "line",
        title: `${firstNumCol.name} Over Time`,
        description: "Track trends and changes",
        columns: [firstDateCol.name, firstNumCol.name],
        reason: "Ideal for time series data",
      })
      
      suggestions.push({
        type: "area",
        title: `${firstNumCol.name} Accumulation`,
        description: "Show cumulative values",
        columns: [firstDateCol.name, firstNumCol.name],
        reason: "Emphasizes volume under the line",
      })
    }
  }
  
  return suggestions.slice(0, 8)
}

function generateInsights(columns: ColumnAnalysis[]): string[] {
  const insights: string[] = []
  
  const totalNulls = columns.reduce((acc, col) => acc + col.nullCount, 0)
  if (totalNulls > 0) {
    insights.push(`Dataset contains ${totalNulls} missing values across ${columns.length} columns`)
  }
  
  const highCardinality = columns.filter(c => c.uniqueCount / c.totalCount > 0.9)
  if (highCardinality.length > 0) {
    insights.push(`${highCardinality.length} column(s) have high cardinality - good for unique identifiers`)
  }
  
  const numericCols = columns.filter(c => c.statistics)
  if (numericCols.length > 0) {
    numericCols.forEach(col => {
      if (col.statistics) {
        insights.push(`${col.name}: ranges from ${col.statistics.min} to ${col.statistics.max} (avg: ${col.statistics.avg})`)
      }
    })
  }
  
  return insights
}
