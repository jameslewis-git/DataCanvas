"use client"

import { DataRow } from "@/lib/parser"

interface FunnelChartWidgetProps {
  data: DataRow[]
  xKey: string
  yKey: string
  title?: string
}

const COLORS = [
  "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", 
  "#4c1d95", "#3b0d7a", "#2d0660", "#1e0446"
]

export function FunnelChartWidget({ data, xKey, yKey, title }: FunnelChartWidgetProps) {
  const sortedData = [...data]
    .map(row => ({
      name: String(row[xKey] ?? ""),
      value: Number(row[yKey]) || 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const maxValue = sortedData[0]?.value || 1

  return (
    <div className="w-full h-full p-4">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <div className="w-full h-[90%] flex flex-col items-center justify-center gap-2">
        {sortedData.map((item, index) => {
          const widthPercent = (item.value / maxValue) * 100
          const color = COLORS[index % COLORS.length]
          
          return (
            <div
              key={index}
              className="relative group"
              style={{ width: `${widthPercent}%` }}
            >
              <div
                className="w-full py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{ 
                  backgroundColor: color,
                  clipPath: index === 0 
                    ? "polygon(0 0, 100% 0, 95% 100%, 5% 100%)"
                    : index === sortedData.length - 1
                    ? "polygon(5% 0, 95% 0, 100% 100%, 0 100%)"
                    : "polygon(5% 0, 95% 0, 90% 100%, 10% 100%)"
                }}
              >
                <div className="flex items-center justify-between text-white">
                  <span className="font-medium truncate mr-2">{item.name}</span>
                  <span className="font-bold whitespace-nowrap">{item.value.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {((item.value / maxValue) * 100).toFixed(1)}% of max
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
