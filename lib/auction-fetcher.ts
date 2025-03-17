import * as cheerio from "cheerio"

interface AuctionItem {
  title: string
  price: number
  date: string
  url: string
}

export async function fetchAuctionData(query: string): Promise<AuctionItem[]> {
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

// 複数ページのデータを取得する拡張機能（必要に応じて実装）
export async function fetchMultiPageAuctionData(query: string, maxPages = 3): Promise<AuctionItem[]> {
  let allItems: AuctionItem[] = []

  for (let page = 1; page <= maxPages; page++) {
    try {
      const encodedQuery = encodeURIComponent(query)
      const offset = (page - 1) * 100
      const searchUrl = `https://auctions.yahoo.co.jp/search/closed?p=${encodedQuery}&va=${encodedQuery}&exflg=1&b=${offset + 1}&n=100&s1=end&o1=d`

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
      const $ = cheerio.load(html)
      const pageItems: AuctionItem[] = []

      // 各オークションアイテムを処理
      $(".Result__item").each((_, element) => {
        try {
          const titleElement = $(element).find(".Product__title a")
          const title = titleElement.text().trim()
          const url = titleElement.attr("href") || ""

          const priceText = $(element).find(".Product__priceValue").text().trim()
          const price = Number.parseInt(priceText.replace(/[^\d]/g, ""), 10)

          const dateText = $(element).find(".Product__time").text().trim()
          const date = formatYahooAuctionDate(dateText)

          if (title && !isNaN(price) && date) {
            pageItems.push({ title, price, date, url })
          }
        } catch (err) {
          console.error("Error parsing auction item:", err)
        }
      })

      // 結果がない場合は終了
      if (pageItems.length === 0) {
        break
      }

      allItems = [...allItems, ...pageItems]

      // 連続リクエストを避けるための遅延
      if (page < maxPages) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error)
      break
    }
  }

  return allItems
}

