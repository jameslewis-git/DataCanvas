"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { DataRow } from "@/lib/parser"

interface AreaChartWidgetProps {
  data: DataRow[]
  xKey: string
  yKey: string
  title?: string
  color?: string
}

export function AreaChartWidget({ data, xKey, yKey, title, color = "#8b5cf6" }: AreaChartWidgetProps) {
  const chartData = data.map(row => ({
    name: String(row[xKey] ?? ""),
    value: Number(row[yKey]) || 0,
  }))

  return (
    <div className="w-full h-full p-4">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis 
            dataKey="name" 
            stroke="#a1a1aa" 
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
          />
          <YAxis stroke="#a1a1aa" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color.replace("#", "")})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
