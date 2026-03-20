"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { DataRow } from "@/lib/parser"

interface PieChartWidgetProps {
  data: DataRow[]
  nameKey: string
  valueKey: string
  title?: string
}

const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#6366f1", "#ef4444", "#14b8a6"]

export function PieChartWidget({ data, nameKey, valueKey, title }: PieChartWidgetProps) {
  const chartData = data.map(row => ({
    name: String(row[nameKey] ?? ""),
    value: Number(row[valueKey]) || 0,
  }))

  return (
    <div className="w-full h-full p-4">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={true}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Legend 
            wrapperStyle={{ color: "#a1a1aa" }}
            formatter={(value) => <span style={{ color: "#a1a1aa" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DonutChartWidget({ data, nameKey, valueKey, title }: PieChartWidgetProps) {
  const chartData = data.map(row => ({
    name: String(row[nameKey] ?? ""),
    value: Number(row[valueKey]) || 0,
  }))

  return (
    <div className="w-full h-full p-4">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="70%"
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Legend 
            wrapperStyle={{ color: "#a1a1aa" }}
            formatter={(value) => <span style={{ color: "#a1a1aa" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
