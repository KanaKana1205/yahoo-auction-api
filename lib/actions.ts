"use server"

import { parseExcelFile } from "@/lib/excel-parser"
import { fetchAuctionData } from "@/lib/auction-fetcher"
import { calculateStats } from "@/lib/utils"

export async function searchAuctions(query: string) {
  try {
    // Fetch auction data from Yahoo Auctions
    const items = await fetchAuctionData(query)

    // Calculate statistics
    const stats = calculateStats(items.map((item) => item.price))

    return {
      query,
      items,
      stats,
    }
  } catch (error) {
    console.error("Error searching auctions:", error)
    throw new Error("検索中にエラーが発生しました")
  }
}

export async function processExcelFile(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      throw new Error("ファイルが見つかりません")
    }

    // Parse Excel file to get queries
    const queries = await parseExcelFile(file)

    // Process each query
    const results = await Promise.all(
      queries.map(async (query) => {
        try {
          const items = await fetchAuctionData(query)
          const stats = calculateStats(items.map((item) => item.price))

          return {
            query,
            items,
            stats,
          }
        } catch (error) {
          console.error(`Error processing query "${query}":`, error)
          return {
            query,
            items: [],
            stats: {
              average: 0,
              median: 0,
              min: 0,
              max: 0,
              count: 0,
            },
          }
        }
      }),
    )

    return {
      queries: results,
    }
  } catch (error) {
    console.error("Error processing Excel file:", error)
    throw new Error("Excelファイルの処理中にエラーが発生しました")
  }
}

