import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="bg-zinc-50 font-sans dark:bg-black">
      <main className="min-h-dvh p-4">
        <h1>Invoice Generator</h1>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section aria-labelledby="editor-title">
            <Card>
              <CardHeader>
                <CardTitle id="editor-title">Editor</CardTitle>
              </CardHeader>
              <CardContent>
                Form
              </CardContent>
            </Card>
          </section>
          <section aria-labelledby="preview-title">
            <Card>
              <CardHeader>
                <CardTitle id="preview-title">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                Preview Content
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
