export default function NoteDetailLoading() {
  return (
    <main className="flex min-h-full flex-1 flex-col bg-[var(--r2a-canvas-soft)]">
      <div className="mx-auto flex w-full max-w-[920px] flex-1 flex-col gap-8 px-8 py-10">
        <nav className="flex items-center gap-2" aria-label="笔记加载中">
          <div className="h-3 w-24 rounded-full bg-[var(--r2a-hover)]" />
          <div className="h-3 w-2 rounded-full bg-[var(--r2a-hairline)]" />
          <div className="h-3 w-44 rounded-full bg-[var(--r2a-hover)]" />
        </nav>

        <header className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="h-9 w-3/4 rounded-[var(--r2a-radius-sm)] bg-[var(--r2a-hover)]" />
            <div className="flex flex-wrap gap-2">
              <div className="h-3 w-24 rounded-full bg-[var(--r2a-hover)]" />
              <div className="h-3 w-28 rounded-full bg-[var(--r2a-hover)]" />
              <div className="h-3 w-20 rounded-full bg-[var(--r2a-hover)]" />
            </div>
          </div>
          <div className="hidden gap-2 sm:flex">
            <div className="h-8 w-16 rounded-[var(--r2a-radius-md)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)]" />
            <div className="h-8 w-16 rounded-[var(--r2a-radius-md)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)]" />
            <div className="size-8 rounded-[var(--r2a-radius-md)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)]" />
          </div>
        </header>

        <div className="flex gap-6 border-b border-[var(--r2a-hairline)]">
          <div className="flex flex-col gap-2 pb-3">
            <div className="h-4 w-16 rounded-full bg-[var(--r2a-hover)]" />
            <div className="h-0.5 w-16 rounded-full bg-[var(--r2a-hairline)]" />
          </div>
          <div className="h-4 w-16 rounded-full bg-[var(--r2a-hover)]" />
        </div>

        <section className="flex flex-col gap-4">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-[var(--r2a-radius-lg)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-6 py-5 shadow-[var(--r2a-shadow-soft)]"
            >
              <div className="h-4 w-24 rounded-full bg-[var(--r2a-hover)]" />
              <div className="mt-4 flex flex-col gap-2">
                <div className="h-3 w-full rounded-full bg-[var(--r2a-hover)]" />
                <div className="h-3 w-5/6 rounded-full bg-[var(--r2a-hover)]" />
                <div className="h-3 w-2/3 rounded-full bg-[var(--r2a-hover)]" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
