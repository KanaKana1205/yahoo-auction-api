import { SearchForm } from "@/components/search-form"
import { UploadForm } from "@/components/upload-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
      </div>
    </main>
  )
}

