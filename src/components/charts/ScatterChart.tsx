"use client"

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts"
import { DataRow } from "@/lib/parser"

interface ScatterChartWidgetProps {
  data: DataRow[]
  xKey: string
  yKey: string
  sizeKey?: string
  title?: string
  color?: string
}

export function ScatterChartWidget({ data, xKey, yKey, sizeKey, title, color = "#8b5cf6" }: ScatterChartWidgetProps) {
  const chartData = data.map(row => ({
    x: Number(row[xKey]) || 0,
    y: Number(row[yKey]) || 0,
    z: sizeKey ? Number(row[sizeKey]) || 1 : 1,
  }))

  return (
    <div className="w-full h-full p-4">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={xKey}
            stroke="#a1a1aa" 
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            label={{ value: xKey, position: "insideBottom", offset: -5, fill: "#a1a1aa" }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={yKey}
            stroke="#a1a1aa" 
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            label={{ value: yKey, angle: -90, position: "insideLeft", fill: "#a1a1aa" }}
          />
          {sizeKey && <ZAxis type="number" dataKey="z" name={sizeKey} range={[50, 400]} />}
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Scatter name="Values" data={chartData} fill={color} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
