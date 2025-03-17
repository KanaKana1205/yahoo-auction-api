import { formatPrice } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export function PriceStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">平均価格</div>
          <div className="text-2xl font-bold">{formatPrice(stats.average)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">中央値</div>
          <div className="text-2xl font-bold">{formatPrice(stats.median)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">最安値</div>
          <div className="text-2xl font-bold">{formatPrice(stats.min)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">最高値</div>
          <div className="text-2xl font-bold">{formatPrice(stats.max)}</div>
        </CardContent>
      </Card>
    </div>
  )
}

