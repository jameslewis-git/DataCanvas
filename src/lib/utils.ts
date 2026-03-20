import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return "-"
  return new Intl.NumberFormat().format(Number(num))
}

export function truncate(str: string, length: number): string {
  if (!str) return "-"
  return str.length > length ? str.slice(0, length) + "..." : str
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || ""
}

export function isValidJsonFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return ext === "json"
}

export function isValidCsvFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return ext === "csv"
}