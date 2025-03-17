import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import { PriceStats } from "@/components/price-stats"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>一括検索結果</CardTitle>
          <CardDescription>{results.queries.length}件の検索が完了しました</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>検索キーワード</TableHead>
                <TableHead className="text-right">平均価格</TableHead>
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
                  <TableCell className="text-right">{formatPrice(query.stats.min)}</TableCell>
                  <TableCell className="text-right">{formatPrice(query.stats.max)}</TableCell>
                  <TableCell className="text-right">{query.items.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

                  <div className="mt-6">
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

