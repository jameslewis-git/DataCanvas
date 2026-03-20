"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import { DataRow } from "@/lib/parser"

interface RadarChartWidgetProps {
  data: DataRow[]
  xKey: string
  yKey: string
  title?: string
  color?: string
}

export function RadarChartWidget({ data, xKey, yKey, title, color = "#8b5cf6" }: RadarChartWidgetProps) {
  const chartData = data.map(row => ({
    subject: String(row[xKey] ?? ""),
    value: Number(row[yKey]) || 0,
    fullMark: 100,
  }))

  return (
    <div className="w-full h-full p-4">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="#27272a" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
          />
          <PolarRadiusAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} />
          <Radar
            name="Value"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
