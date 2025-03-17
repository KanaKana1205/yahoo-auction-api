"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import { PriceStats } from "@/components/price-stats"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function BatchResults({ results }) {
  if (!results || !results.queries || results.queries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>一括検索結果</CardTitle>
          <CardDescription>検索結果が見つかりませんでした。Excelファイルの形式を確認してください。</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // CSVデータの生成
  const generateSummaryCSV = () => {
    const headers = ["検索キーワード", "平均価格", "中央値", "最安値", "最高値", "件数"]
    const rows = results.queries.map((query) => [
      `"${query.query.replace(/"/g, '""')}"`,
      query.stats.average,
      query.stats.median,
      query.stats.min,
      query.stats.max,
      query.items.length,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `一括検索結果_サマリー.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 詳細CSVデータの生成
  const generateDetailCSV = () => {
    const headers = ["検索キーワード", "商品名", "落札価格", "落札日", "URL"]
    const rows = []

    results.queries.forEach((query) => {
      query.items.forEach((item) => {
        rows.push([
          `"${query.query.replace(/"/g, '""')}"`,
          `"${item.title.replace(/"/g, '""')}"`,
          item.price,
          item.date,
          `"${item.url}"`,
        ])
      })
    })

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `一括検索結果_詳細.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>一括検索結果</CardTitle>
            <CardDescription>{results.queries.length}件の検索が完了しました</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generateSummaryCSV}>
              <Download className="h-4 w-4 mr-2" />
              サマリーCSV
            </Button>
            <Button variant="outline" size="sm" onClick={generateDetailCSV}>
              <Download className="h-4 w-4 mr-2" />
              詳細CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>検索キーワード</TableHead>
                  <TableHead className="text-right">平均価格</TableHead>
                  <TableHead className="text-right">中央値</TableHead>
                  <TableHead className="text-right">最安値</TableHead>
                  <TableHead className="text-right">最高値</TableHead>
                  <TableHead className="text-right">件数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.queries.map((query, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{query.query}</TableCell>
                    <TableCell className="text-right">{formatPrice(query.stats.average)}</TableCell>
                    <TableCell className="text-right">{formatPrice(query.stats.median)}</TableCell>
                    <TableCell className="text-right">{formatPrice(query.stats.min)}</TableCell>
                    <TableCell className="text-right">{formatPrice(query.stats.max)}</TableCell>
                    <TableCell className="text-right">{query.items.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="w-full">
        {results.queries.map((query, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>
              {query.query} の詳細結果 ({query.items.length}件)
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <PriceStats stats={query.stats} />

                  <div className="mt-6 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>商品名</TableHead>
                          <TableHead className="text-right">落札価格</TableHead>
                          <TableHead className="text-right">落札日</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {query.items.map((item, itemIndex) => (
                          <TableRow key={itemIndex}>
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

