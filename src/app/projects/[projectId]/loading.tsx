export default function ProjectDirectoryLoading() {
  return (
    <main className="flex min-h-full flex-1 flex-col bg-[var(--r2a-canvas-soft)]">
      <div className="mx-auto flex w-full max-w-[1020px] flex-1 flex-col gap-8 px-8 py-10">
        <header className="flex items-center gap-3">
          <div className="size-9 rounded-[var(--r2a-radius-sm)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] shadow-[var(--r2a-shadow-soft)]" />
          <div className="h-8 w-44 rounded-[var(--r2a-radius-sm)] bg-[var(--r2a-hover)]" />
        </header>

        <section
          className="flex min-h-[64px] w-full items-center rounded-full border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-5"
          aria-label="项目加载中"
        >
          <div className="h-4 w-1/2 rounded-full bg-[var(--r2a-hover)]" />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-5 w-12 rounded-[var(--r2a-radius-sm)] bg-[var(--r2a-hover)]" />
            <div className="h-px w-6 rounded-sm bg-[var(--r2a-hairline)]" />
          </div>

          <div className="overflow-hidden rounded-[var(--r2a-radius-lg)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] shadow-[var(--r2a-shadow-soft)]">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="grid gap-3 border-b border-[var(--r2a-hairline-soft)] px-5 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_minmax(160px,240px)_120px_40px] lg:items-center lg:gap-6"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-10 rounded-[var(--r2a-radius-sm)] bg-[var(--r2a-hover)]" />
                    <div className="h-4 w-56 rounded-full bg-[var(--r2a-hover)]" />
                  </div>
                  <div className="mt-2 h-3 w-2/3 rounded-full bg-[var(--r2a-hover)]" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-5 w-12 rounded-[var(--r2a-radius-sm)] bg-[var(--r2a-hover)]" />
                  <div className="h-5 w-14 rounded-[var(--r2a-radius-sm)] bg-[var(--r2a-hover)]" />
                </div>
                <div className="h-3 w-20 rounded-full bg-[var(--r2a-hover)]" />
                <div className="size-8 rounded-[var(--r2a-radius-md)] bg-[var(--r2a-hover)]" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
