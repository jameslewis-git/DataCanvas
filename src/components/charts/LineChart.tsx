"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { DataRow } from "@/lib/parser"

interface LineChartWidgetProps {
  data: DataRow[]
  xKey: string
  yKey: string
  title?: string
  color?: string
}

export function LineChartWidget({ data, xKey, yKey, title, color = "#8b5cf6" }: LineChartWidgetProps) {
  const chartData = data.map(row => ({
    name: String(row[xKey] ?? ""),
    value: Number(row[yKey]) || 0,
  }))

  return (
    <div className="w-full h-full p-4">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
