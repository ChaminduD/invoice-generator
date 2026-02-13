export default function Home() {
  return (
    <div className="bg-zinc-50 font-sans dark:bg-black">
      <main className="min-h-dvh p-4">
        <h1>Invoice Generator</h1>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border p-4">
            Editor
          </section>
          <section className="rounded-xl border p-4">
            Preview
          </section>
        </div>
      </main>
    </div>
  );
}
