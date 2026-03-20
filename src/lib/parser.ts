import Papa from "papaparse"

export type DataRow = Record<string, unknown>

export async function parseJsonFile(file: File): Promise<DataRow[]> {
  const text = await file.text()
  const data = JSON.parse(text)
  return Array.isArray(data) ? data : [data]
}

export function parseCsvFile(file: File): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data as DataRow[])
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

export function exportToJson(data: DataRow[]): string {
  return JSON.stringify(data, null, 2)
}

export function exportToCsv(data: DataRow[]): string {
  return Papa.unparse(data)
}