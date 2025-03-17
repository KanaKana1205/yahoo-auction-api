import * as XLSX from "xlsx"

export async function parseExcelFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        // Extract queries from the first column
        const queries = jsonData
          .map((row) => row[0])
          .filter((query) => query && typeof query === "string" && query.trim() !== "")

        resolve(queries)
      } catch (err) {
        // 未使用の変数を修正
        reject(new Error("Excelファイルの解析に失敗しました: " + String(err)))
      }
    }

    reader.onerror = () => {
      reject(new Error("ファイルの読み込みに失敗しました"))
    }

    reader.readAsArrayBuffer(file)
  })
}

