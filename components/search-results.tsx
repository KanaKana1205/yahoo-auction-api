"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import { PriceStats } from "@/components/price-stats"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function SearchResults({ results }) {
  if (!results || !results.items || results.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>検索結果</CardTitle>
          <CardDescription>
            該当する落札商品が見つかりませんでした。検索キーワードを変更してお試しください。
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // CSVデータの生成
  const generateCSV = () => {
    const headers = ["商品名", "落札価格", "落札日", "URL"]
    const rows = results.items.map((item) => [
      `"${item.title.replace(/"/g, '""')}"`,
      item.price,
      item.date,
      `"${item.url}"`,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${results.query}_落札相場.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>検索結果: {results.query}</CardTitle>
            <CardDescription>{results.items.length}件の落札商品が見つかりました</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={generateCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSVダウンロード
          </Button>
        </CardHeader>
        <CardContent>
          <PriceStats stats={results.stats} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>落札商品一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品名</TableHead>
                  <TableHead className="text-right">落札価格</TableHead>
                  <TableHead className="text-right">落札日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {item.title}
                      </a>
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                    <TableCell className="text-right">{item.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

