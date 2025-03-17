import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
  }).format(price)
}

export function calculateStats(prices: number[]) {
  if (!prices || prices.length === 0) {
    return {
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      count: 0,
    }
  }

  // Sort prices for median calculation
  const sortedPrices = [...prices].sort((a, b) => a - b)

  // Calculate median
  const middle = Math.floor(sortedPrices.length / 2)
  const median =
    sortedPrices.length % 2 === 0 ? (sortedPrices[middle - 1] + sortedPrices[middle]) / 2 : sortedPrices[middle]

  return {
    average: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length),
    median: Math.round(median),
    min: Math.min(...prices),
    max: Math.max(...prices),
    count: prices.length,
  }
}

