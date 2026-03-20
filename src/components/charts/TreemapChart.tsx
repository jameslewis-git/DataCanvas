"use client"

import { DataRow } from "@/lib/parser"

interface TreemapChartWidgetProps {
  data: DataRow[]
  xKey: string
  yKey: string
  title?: string
}

const COLORS = [
  "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", 
  "#3b82f6", "#6366f1", "#ef4444", "#14b8a6",
  "#f97316", "#06b6d4", "#84cc16", "#a855f7"
]

interface TreemapItem {
  name: string
  value: number
  color: string
}

export function TreemapChartWidget({ data, xKey, yKey, title }: TreemapChartWidgetProps) {
  const total = data.reduce((acc, row) => acc + (Number(row[yKey]) || 0), 0)
  
  const items: TreemapItem[] = data.map((row, index) => ({
    name: String(row[xKey] ?? `Item ${index + 1}`),
    value: Number(row[yKey]) || 0,
    color: COLORS[index % COLORS.length] ?? "#8b5cf6",
  })).sort((a, b) => b.value - a.value).slice(0, 12)

  function getLayout(items: TreemapItem[], x: number, y: number, width: number, height: number): { item: TreemapItem; x: number; y: number; w: number; h: number }[] {
    if (items.length === 0) return []
    
    const result: { item: TreemapItem; x: number; y: number; w: number; h: number }[] = []
    const totalValue = items.reduce((acc, item) => acc + item.value, 0)
    
    let currentX = x
    let currentY = y
    const isHorizontal = width >= height
    
    items.forEach((item) => {
      const ratio = item.value / totalValue
      let w: number, h: number
      
      if (isHorizontal) {
        w = width * ratio
        h = height
      } else {
        w = width
        h = height * ratio
      }
      
      if (w >= 20 && h >= 20) {
        result.push({ item, x: currentX, y: currentY, w, h })
      }
      
      if (isHorizontal) {
        currentX += w
      } else {
        currentY += h
      }
    })
    
    return result
  }

  const layout = getLayout(items, 0, 0, 100, 100)

  return (
    <div className="w-full h-full p-4">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <div className="w-full h-[90%] relative" style={{ paddingBottom: "56.25%" }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0 }}>
          {layout.map((rect, index) => (
            <g key={index}>
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                fill={rect.item.color}
                stroke="#18181b"
                strokeWidth="0.5"
                rx="4"
              />
              {rect.w > 8 && rect.h > 8 && (
                <>
                  <text
                    x={rect.x + rect.w / 2}
                    y={rect.y + rect.h / 2 - 4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="2.5"
                    fontWeight="bold"
                  >
                    {rect.item.name.length > 10 ? rect.item.name.slice(0, 10) + "..." : rect.item.name}
                  </text>
                  <text
                    x={rect.x + rect.w / 2}
                    y={rect.y + rect.h / 2 + 4}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.8)"
                    fontSize="2"
                  >
                    {Math.round((rect.item.value / total) * 100)}%
                  </text>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
