import { Button, Card } from '@/shared/ui';

export function HomePage() {
  return (
    <>
      {/* <!-- Hero Section --> */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* <!-- Hero Content --> */}
          <div className="max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
              Zarządzaj zadaniami w
              <span className="text-primary"> jednym miejscu</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-10">
              Intuicyjna tablica Kanban dla zespołów, które cenią czas i
              efektywność. Zapomnij o chaosie i skup się na tym, co naprawdę
              ważne.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                size="l"
                to="/register"
                className="w-full sm:w-auto shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Zacznij za darmo
              </Button>
              <Button
                variant="secondary"
                size="l"
                to="/login"
                className="w-full sm:w-auto"
              >
                Zobacz demo
              </Button>
            </div>
          </div>
          {/* <!-- Product Mockup Container --> */}
          <div className="relative max-w-5xl mx-auto">
            {/* <!-- Decorative Background Gradients --> */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
              {/* <!-- Browser Window Header --> */}
              <div className="h-10 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-1.5 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              {/* <!-- App UI Mockup --> */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* <!-- Column 1: To Do --> */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        Do zrobienia
                        <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          3
                        </span>
                      </h3>
                      <span className="material-symbols-outlined text-slate-400">
                        more_horiz
                      </span>
                    </div>
                    <Card className="flex flex-col gap-3 rounded-lg!">
                      <div className="flex gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded">
                          Design
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Odświeżenie logo Orbit
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white dark:border-slate-900"></div>
                          <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white dark:border-slate-900"></div>
                        </div>
                        <span className="material-symbols-outlined text-sm text-slate-400">
                          chat_bubble
                        </span>
                      </div>
                    </Card>
                    <Card className="rounded-lg!">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Przygotowanie kampanii Social Media
                      </p>
                    </Card>
                  </div>
                  {/* <!-- Column 2: In Progress --> */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        W trakcie
                        <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          2
                        </span>
                      </h3>
                      <span className="material-symbols-outlined text-slate-400">
                        more_horiz
                      </span>
                    </div>
                    <Card className="flex flex-col gap-3 rounded-lg! border-l-4 border-l-primary">
                      <div className="flex gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded">
                          Dev
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Integracja z API Slack
                      </p>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-primary h-full w-[65%]"></div>
                      </div>
                    </Card>
                  </div>
                  {/* <!-- Column 3: Done --> */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        Zakończone
                        <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          8
                        </span>
                      </h3>
                      <span className="material-symbols-outlined text-slate-400">
                        more_horiz
                      </span>
                    </div>
                    <Card className="rounded-lg! opacity-60">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-through">
                        Strona landing page - v1
                      </p>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <!-- Features Section --> */}
      <section className="py-24 bg-white dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
              Wszystko, czego potrzebuje Twój zespół
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Orbit to kompletne narzędzie do zarządzania projektami, które
              pomaga zespołom pracować mądrzej, a nie ciężej.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* <!-- Feature 1 --> */}
            <Card
              padding="large"
              className="rounded-2xl bg-background-light dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  view_kanban
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Tablice Kanban
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Wizualne śledzenie zadań i postępów projektu na czytelnych
                tablicach, które możesz dowolnie konfigurować.
              </p>
            </Card>
            {/* <!-- Feature 2 --> */}
            <Card
              padding="large"
              className="rounded-2xl bg-background-light dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  chat_bubble
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Komentarze
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Komunikacja zespołowa bezpośrednio w kontekście konkretnych
                zadań. Wszystkie ustalenia w jednym miejscu.
              </p>
            </Card>
            {/* <!-- Feature 3 --> */}
            <Card
              padding="large"
              className="rounded-2xl bg-background-light dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  sync_alt
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Współpraca w czasie rzeczywistym
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Błyskawiczna synchronizacja zmian u wszystkich członków zespołu
                jednocześnie. Bez przeładowywania strony.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
