import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string, style: 'short' | 'long' = 'short'): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: style, day: 'numeric', year: 'numeric' })
}

export function cleanHostname(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}
