import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"
import * as XLSX from "xlsx"

// 型定義
interface AuctionItem {
  title: string
  price: number
  date: string
  url: string
}

interface QueryResult {
  query: string
  items: AuctionItem[]
  stats: {
    average: number
    median: number
    min: number
    max: number
    count: number
  }
}

interface BatchResponse {
  queries: QueryResult[]
}

// Yahoo Auctionの日付形式を標準形式に変換
function formatYahooAuctionDate(dateText: string): string {
  try {
    // 「MM月DD日」または「YYYY年MM月DD日」形式を処理
    const now = new Date()
    const currentYear = now.getFullYear()

    // 年が含まれているかチェック
    let year = currentYear
    let monthDayText = dateText

    if (dateText.includes("年")) {
      const yearMatch = dateText.match(/(\d+)年/)
      if (yearMatch && yearMatch[1]) {
        year = Number.parseInt(yearMatch[1], 10)
        monthDayText = dateText.split("年")[1]
      }
    }

    // 月と日を抽出
    const monthMatch = monthDayText.match(/(\d+)月/)
    const dayMatch = monthDayText.match(/(\d+)日/)

    if (monthMatch && monthMatch[1] && dayMatch && dayMatch[1]) {
      const month = Number.parseInt(monthMatch[1], 10)
      const day = Number.parseInt(dayMatch[1], 10)

      // ISO形式の日付文字列を作成 (YYYY-MM-DD)
      return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
    }

    // パースできない場合は現在の日付を返す
    return now.toISOString().split("T")[0]
  } catch (error) {
    console.error("Error parsing date:", error, dateText)
    return new Date().toISOString().split("T")[0]
  }
}

// 統計情報を計算する関数
function calculateStats(prices: number[]) {
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

// ヤフオクからデータを取得する関数
async function fetchAuctionData(query: string): Promise<AuctionItem[]> {
  try {
    // URLエンコードしてクエリを準備
    const encodedQuery = encodeURIComponent(query)

    // 終了したオークションを検索するURL
    const searchUrl = `https://auctions.yahoo.co.jp/search/closed?p=${encodedQuery}&va=${encodedQuery}&exflg=1&b=1&n=100&s1=end&o1=d`

    console.log(`Fetching auction data from: ${searchUrl}`)

    // ページを取得
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch auction data: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()

    // HTMLをパース
    const $ = cheerio.load(html)
    const items: AuctionItem[] = []

    // 各オークションアイテムを処理
    $(".Result__item").each((_, element) => {
      try {
        // タイトルと商品URL
        const titleElement = $(element).find(".Product__title a")
        const title = titleElement.text().trim()
        const url = titleElement.attr("href") || ""

        // 価格（テキストから数値に変換）
        const priceText = $(element).find(".Product__priceValue").text().trim()
        const price = Number.parseInt(priceText.replace(/[^\d]/g, ""), 10)

        // 終了日時
        const dateText = $(element).find(".Product__time").text().trim()
        const date = formatYahooAuctionDate(dateText)

        // 有効なデータのみ追加
        if (title && !isNaN(price) && date) {
          items.push({ title, price, date, url })
        }
      } catch (err) {
        console.error("Error parsing auction item:", err)
      }
    })

    console.log(`Found ${items.length} auction items for query: ${query}`)
    return items
  } catch (error) {
    console.error("Error fetching auction data:", error)
    throw new Error("オークションデータの取得中にエラーが発生しました")
  }
}

// Excelファイルを解析する関数
async function parseExcelFile(buffer: ArrayBuffer): Promise<string[]> {
  try {
    // Excelファイルを読み込む
    const data = new Uint8Array(buffer)
    const workbook = XLSX.read(data, { type: "array" })

    // 最初のシートを取得
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]

    // JSONに変換
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    // 最初の列からクエリを抽出
    const queries = jsonData
      .map((row: any) => row[0])
      .filter((query: any) => query && typeof query === "string" && query.trim() !== "")

    return queries
  } catch (error) {
    console.error("Error parsing Excel file:", error)
    throw new Error("Excelファイルの解析に失敗しました")
  }
}

// APIエンドポイント
export async function POST(request: NextRequest) {
  // CORSヘッダーを設定
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  }

  // OPTIONSリクエスト（プリフライトリクエスト）の処理
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { headers })
  }

  try {
    // フォームデータを取得
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 400, headers })
    }

    // ファイルをArrayBufferに変換
    const buffer = await file.arrayBuffer()

    // Excelファイルを解析してクエリを取得
    const queries = await parseExcelFile(buffer)

    if (queries.length === 0) {
      return NextResponse.json({ error: "有効なクエリが見つかりません" }, { status: 400, headers })
    }

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

    // 結果を返す
    const response: BatchResponse = {
      queries: results,
    }

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "不明なエラーが発生しました" },
      { status: 500, headers },
    )
  }
}

