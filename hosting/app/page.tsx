import Gallery from "./components/Gallery";

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="mx-auto w-full max-w-6xl px-4 pt-12">
        <h1 className="text-3xl font-semibold tracking-tight">Photography</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          A curated set of images with a smooth blur-to-sharp reveal.
        </p>
      </header>
      <Gallery />
    </main>
  );
}
