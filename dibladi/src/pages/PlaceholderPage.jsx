function PlaceholderPage({ title }) {
  return (
    <main className="min-h-screen bg-off-white px-6 py-16 text-black-text">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-border bg-white p-10 text-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-gray-text">Page de demonstration pour la route {title}.</p>
      </section>
    </main>
  )
}

export default PlaceholderPage
