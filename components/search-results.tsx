import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"
import { PriceStats } from "@/components/price-stats"

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>検索結果: {results.query}</CardTitle>
          <CardDescription>{results.items.length}件の落札商品が見つかりました</CardDescription>
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
        </CardContent>
      </Card>
    </div>
  )
}

