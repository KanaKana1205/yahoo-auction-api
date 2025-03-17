import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// basePath取得用のヘルパー関数
export function getBasePath() {
  // クライアントサイドとサーバーサイドの両方で動作するように
  if (typeof window !== "undefined") {
    // クライアントサイドでの実行
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/serch"
    return basePath
  } else {
    // サーバーサイドでの実行
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/serch"
    return basePath
  }
}

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

  // 外れ値を除外（オプション）
  // 平均から標準偏差の3倍以上離れた値を除外
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length
  const stdDev = Math.sqrt(prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length)

  // 外れ値の閾値
  const lowerThreshold = mean - 3 * stdDev
  const upperThreshold = mean + 3 * stdDev

  // 外れ値を除外したデータ
  const filteredPrices = prices.filter((price) => price >= lowerThreshold && price <= upperThreshold)

  // 外れ値除外後のデータがない場合は元のデータを使用
  const finalPrices = filteredPrices.length > 0 ? filteredPrices : prices

  // ソートして中央値を計算
  const sortedPrices = [...finalPrices].sort((a, b) => a - b)
  const middle = Math.floor(sortedPrices.length / 2)
  const median =
    sortedPrices.length % 2 === 0 ? (sortedPrices[middle - 1] + sortedPrices[middle]) / 2 : sortedPrices[middle]

  return {
    average: Math.round(finalPrices.reduce((sum, price) => sum + price, 0) / finalPrices.length),
    median: Math.round(median),
    min: Math.min(...finalPrices),
    max: Math.max(...finalPrices),
    count: finalPrices.length,
  }
}

// 外れ値を除外せずに統計を計算する関数（オプション）
export function calculateRawStats(prices: number[]) {
  if (!prices || prices.length === 0) {
    return {
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      count: 0,
    }
  }

  // ソートして中央値を計算
  const sortedPrices = [...prices].sort((a, b) => a - b)
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

