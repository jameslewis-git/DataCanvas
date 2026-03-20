"use client"

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts"

interface GaugeChartWidgetProps {
  value: number
  min?: number
  max?: number
  title?: string
  color?: string
}

export function GaugeChartWidget({ value, min = 0, max = 100, title, color = "#8b5cf6" }: GaugeChartWidgetProps) {
  const percentage = ((value - min) / (max - min)) * 100
  const data = [
    { name: "value", value: percentage, fill: color },
    { name: "empty", value: 100 - percentage, fill: "#27272a" },
  ]

  return (
    <div className="w-full h-full p-4 flex flex-col items-center justify-center">
      {title && <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>}
      <div className="relative flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="70%"
            innerRadius="60%"
            outerRadius="90%"
            barSize={20}
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              background
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
          <span className="text-4xl font-bold text-white">{value}</span>
          <span className="text-sm text-zinc-400">{min} - {max}</span>
        </div>
      </div>
    </div>
  )
}
