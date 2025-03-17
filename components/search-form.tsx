"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { searchAuctions } from "@/lib/actions"
import { SearchResults } from "@/components/search-results"
import { Loader2 } from "lucide-react"

export function SearchForm() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const data = await searchAuctions(query)
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

