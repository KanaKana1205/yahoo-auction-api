"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchResults } from "@/components/search-results"
import { Loader2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"

// APIのベースURL（Vercel FunctionsのURL）
const API_BASE_URL = "https://yahoo-auction-api.vercel.app/api"

export function SearchForm() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [maxPages, setMaxPages] = useState(3)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError("")

    try {
      // APIを呼び出して検索を実行
      const url = `${API_BASE_URL}/search?query=${encodeURIComponent(query)}&maxPages=${maxPages}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`検索に失敗しました: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError("検索中にエラーが発生しました。もう一度お試しください。")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          商品名や型番を入力して、過去の落札相場を検索します。 例: CF-LV9RDAVS 10310 256
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">検索キーワード</Label>
            <Input
              id="query"
              placeholder="商品名や型番を入力"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="max-pages">検索ページ数: {maxPages}</Label>
              <span className="text-sm text-muted-foreground">多いほど結果が増えますが時間がかかります</span>
            </div>
            <Slider
              id="max-pages"
              min={1}
              max={5}
              step={1}
              value={[maxPages]}
              onValueChange={(value) => setMaxPages(value[0])}
              className="py-4"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                検索中...
              </>
            ) : (
              "相場を検索"
            )}
          </Button>
        </form>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      {results && <SearchResults results={results} />}
    </div>
  )
}

