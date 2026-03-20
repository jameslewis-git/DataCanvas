"use client"

import { DataRow } from "@/lib/parser"

interface HeatmapChartWidgetProps {
  data: DataRow[]
  xKey: string
  yKey: string
  valueKey: string
  title?: string
}

export function HeatmapChartWidget({ data, xKey, yKey, valueKey, title }: HeatmapChartWidgetProps) {
  const uniqueX = [...new Set(data.map(row => String(row[xKey] ?? "")))]
  const uniqueY = [...new Set(data.map(row => String(row[yKey] ?? "")))]
  
  const getValue = (x: string, y: string): number => {
    const row = data.find(r => String(r[xKey]) === x && String(r[yKey]) === y)
    return row ? Number(row[valueKey]) || 0 : 0
  }
  
  const allValues = data.map(row => Number(row[valueKey]) || 0)
  const maxValue = Math.max(...allValues, 1)
  const minValue = Math.min(...allValues, 0)
  
  const getColor = (value: number): string => {
    const normalized = (value - minValue) / (maxValue - minValue || 1)
    
    if (normalized < 0.25) return "rgb(59, 7, 100)"
    if (normalized < 0.5) return "rgb(124, 58, 237)"
    if (normalized < 0.75) return "rgb(168, 85, 247)"
    return "rgb(233, 213, 255)"
  }

  return (
    <div className="w-full h-full p-4 overflow-auto">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <div className="min-w-max">
        <div className="flex">
          <div className="w-20 shrink-0" />
          {uniqueX.map((x, i) => (
            <div 
              key={i} 
              className="flex-1 text-center text-xs text-zinc-400 px-1 truncate"
              title={x}
            >
              {x.length > 8 ? x.slice(0, 8) + "..." : x}
            </div>
          ))}
        </div>
        
        {uniqueY.map((y, yIndex) => (
          <div key={yIndex} className="flex items-center">
            <div 
              className="w-20 shrink-0 text-xs text-zinc-400 px-2 py-1 truncate"
              title={y}
            >
              {y.length > 10 ? y.slice(0, 10) + "..." : y}
            </div>
            {uniqueX.map((x, xIndex) => {
              const value = getValue(x, y)
              const color = getColor(value)
              
              return (
                <div
                  key={`${xIndex}-${yIndex}`}
                  className="flex-1 aspect-square m-0.5 rounded flex items-center justify-center text-xs font-medium transition-transform hover:scale-110 cursor-pointer group relative"
                  style={{ backgroundColor: color }}
                  title={`${x} × ${y}: ${value.toLocaleString()}`}
                >
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {value.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-zinc-400">Low</span>
        <div className="flex h-3 w-32">
          <div className="flex-1 rounded-l" style={{ backgroundColor: "rgb(59, 7, 100)" }} />
          <div className="flex-1" style={{ backgroundColor: "rgb(124, 58, 237)" }} />
          <div className="flex-1" style={{ backgroundColor: "rgb(168, 85, 247)" }} />
          <div className="flex-1 rounded-r" style={{ backgroundColor: "rgb(233, 213, 255)" }} />
        </div>
        <span className="text-xs text-zinc-400">High</span>
      </div>
    </div>
  )
}
