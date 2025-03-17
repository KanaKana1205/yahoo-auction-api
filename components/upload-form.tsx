"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { processExcelFile } from "@/lib/actions"
import { BatchResults } from "@/components/batch-results"
import { Loader2, FileSpreadsheet } from "lucide-react"

export function UploadForm() {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState("")
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
        setError("Excelファイル(.xlsx または .xls)のみアップロード可能です。")
        setFile(null)
        setFileName("")
        return
      }

      setFile(selectedFile)
      setFileName(selectedFile.name)
      setError("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const data = await processExcelFile(formData)
      setResults(data)
    } catch (err) {
      setError("ファイル処理中にエラーが発生しました。もう一度お試しください。")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Excelファイルをアップロードして、複数の商品の相場を一括検索します。
          ファイルの1列目に検索キーワードを入力してください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Excelファイル</Label>
            <div className="flex items-center gap-2">
              <Input id="file" type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file").click()}
                className="w-full"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                ファイルを選択
              </Button>
            </div>
            {fileName && <p className="text-sm mt-2 text-muted-foreground">選択したファイル: {fileName}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={!file || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                処理中...
              </>
            ) : (
              "一括検索を実行"
            )}
          </Button>
        </form>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      {results && <BatchResults results={results} />}
    </div>
  )
}

