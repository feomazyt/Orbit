export function Footer() {
  return (
    <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-1 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">orbit</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Orbit Project Management
            </span>
          </div>
          <div className="flex gap-8">
            <a
              className="text-sm text-slate-500 hover:text-primary transition-colors"
              href="#"
            >
              Polityka prywatności
            </a>
            <a
              className="text-sm text-slate-500 hover:text-primary transition-colors"
              href="#"
            >
              Regulamin
            </a>
            <a
              className="text-sm text-slate-500 hover:text-primary transition-colors"
              href="#"
            >
              Kontakt
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a className="text-slate-400 hover:text-primary" href="#">
              <span className="material-symbols-outlined">public</span>
            </a>
            <a className="text-slate-400 hover:text-primary" href="#">
              <span className="material-symbols-outlined">alternate_email</span>
            </a>
            <a className="text-slate-400 hover:text-primary" href="#">
              <span className="material-symbols-outlined">share</span>
            </a>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-slate-50 dark:border-slate-900">
          <p className="text-sm text-slate-400">
            © 2026 Feomazyt. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
}
