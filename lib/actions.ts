"use server"

import { parseExcelFile } from "@/lib/excel-parser"
import { fetchAuctionData, fetchMultiPageAuctionData } from "@/lib/auction-fetcher"
import { calculateStats } from "@/lib/utils"

export async function searchAuctions(query: string) {
  try {
    // 複数ページから落札データを取得（最大3ページ）
    const items = await fetchMultiPageAuctionData(query, 3)

    // 統計情報を計算
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

    // Excelファイルを解析して検索クエリを取得
    const queries = await parseExcelFile(file)

    // 各クエリを処理
    const results = await Promise.all(
      queries.map(async (query) => {
        try {
          // 各クエリに対して1ページ分のデータを取得（処理時間短縮のため）
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

