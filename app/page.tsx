import { SearchForm } from "@/components/search-form"
import { UploadForm } from "@/components/upload-form"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">ヤフオク相場検索ツール</h1>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">単品検索</TabsTrigger>
            <TabsTrigger value="batch">一括検索 (Excel)</TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="p-4 border rounded-md mt-2">
            <SearchForm />
          </TabsContent>
          <TabsContent value="batch" className="p-4 border rounded-md mt-2">
            <UploadForm />
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>使い方</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">単品検索</h3>
              <p className="text-sm text-muted-foreground">
                商品名や型番を入力して検索すると、ヤフオクの過去の落札相場を表示します。 例えば「CF-LV9RDAVS 10310
                256」のように検索すると、該当する商品の落札価格の平均や中央値などを確認できます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold">一括検索</h3>
              <p className="text-sm text-muted-foreground">
                Excelファイルをアップロードして複数の商品を一度に検索できます。
                Excelファイルの1列目に検索キーワードを入力してください。 結果はCSVでダウンロード可能です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold">注意事項</h3>
              <p className="text-sm text-muted-foreground">
                このツールは個人的な価格調査目的での使用を想定しています。
                短時間に大量の検索を行うと、一時的にアクセスが制限される場合があります。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

