import html2canvas from "html2canvas"
import { DataRow } from "./parser"

export async function exportToPng(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) throw new Error("Element not found")

  const canvas = await html2canvas(element, {
    backgroundColor: "#18181b",
    scale: 2,
    useCORS: true,
    logging: false,
  })

  const link = document.createElement("a")
  link.download = `${filename}.png`
  link.href = canvas.toDataURL("image/png")
  link.click()
}

export async function exportToPdf(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) throw new Error("Element not found")

  const canvas = await html2canvas(element, {
    backgroundColor: "#18181b",
    scale: 2,
    useCORS: true,
    logging: false,
  })

  const imgData = canvas.toDataURL("image/png")
  const w = canvas.width
  const h = canvas.height
  
  const windowFeatures = `width=${w},height=${h},scrollbars=no,resizable=yes`
  const printWindow = window.open("", "_blank", windowFeatures)
  
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { width: ${w}px; height: ${h}px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${imgData}" alt="${filename}" />
        </body>
      </html>
    `)
    printWindow.document.close()
  }
}

export function exportToCsv(data: DataRow[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0] ?? {})
  const csvRows: string[] = []

  csvRows.push(headers.join(","))

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      if (value === null || value === undefined) return ""
      if (typeof value === "object") return JSON.stringify(value)
      const str = String(value)
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
    csvRows.push(values.join(","))
  }

  const csvContent = csvRows.join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.download = `${filename}.csv`
  link.href = url
  link.click()

  URL.revokeObjectURL(url)
}

export function exportToJson(data: DataRow[], filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.download = `${filename}.json`
  link.href = url
  link.click()

  URL.revokeObjectURL(url)
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.download = filename
  link.href = url
  link.click()

  URL.revokeObjectURL(url)
}
