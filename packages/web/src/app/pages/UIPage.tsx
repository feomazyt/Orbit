import { useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Input,
  Modal,
  Textarea,
  useToast,
} from '@/shared/ui';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{title}</h2>
      {children}
    </section>
  );
}

export function UIPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { addToast } = useToast();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
        Design system — Kitchen Sink
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-10">
        Komponenty bazowe w różnych wariantach i stanach.
      </p>

      <Section title="Button">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
              Warianty (rozmiar M)
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
              Rozmiary (primary)
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="s">
                Mały
              </Button>
              <Button variant="primary" size="m">
                Średni
              </Button>
              <Button variant="primary" size="l">
                Duży
              </Button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
              Stan disabled
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" disabled>
                Wyłączony
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Input">
        <div className="max-w-md space-y-6">
          <Input label="E-mail" placeholder="wpisz swój e-mail" />
          <Input
            label="Z ikoną"
            placeholder="Szukaj..."
            leftIcon={<span className="material-symbols-outlined">search</span>}
          />
          <Input
            label="Pole z błędem"
            placeholder="Wpisz wartość"
            error="To pole jest wymagane"
          />
        </div>
      </Section>

      <Section title="Textarea">
        <div className="max-w-md space-y-6">
          <Textarea label="Opis" placeholder="Dodaj opis..." />
          <Textarea
            label="Z błędem"
            placeholder="Treść"
            error="Opis jest wymagany"
          />
        </div>
      </Section>

      <Section title="Card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              Karta domyślna
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tło białe, padding 16px, border-radius 12px, cień.
            </p>
          </Card>
          <Card padding="large" shadow={false}>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              Duży padding, bez cienia
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              padding=&quot;large&quot;, shadow=false.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Modal">
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          Otwórz modal
        </Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Przykładowy modal"
          maxWidth="md"
        >
          <p className="text-slate-600 dark:text-slate-400">
            Zawartość modalu. Zamknij przyciskiem X, klawiszem Escape lub kliknięciem
            w overlay. Focus jest uwięziony wewnątrz (focus trap).
          </p>
        </Modal>
      </Section>

      <Section title="Toast">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Toasty pojawiają się w prawym dolnym rogu i znikają po ok. 4 s.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="s" onClick={() => addToast('Sukces zapisu!', 'success')}>
            Toast success
          </Button>
          <Button variant="secondary" size="s" onClick={() => addToast('Coś poszło nie tak.', 'error')}>
            Toast error
          </Button>
          <Button variant="ghost" size="s" onClick={() => addToast('Informacja dla użytkownika.', 'info')}>
            Toast info
          </Button>
        </div>
      </Section>

      <Section title="Avatar">
        <div className="flex flex-wrap items-end gap-6">
          <div className="text-center">
            <Avatar initials="AK" size="s" />
            <p className="text-xs text-slate-500 mt-2">S (24px)</p>
          </div>
          <div className="text-center">
            <Avatar initials="JD" size="m" />
            <p className="text-xs text-slate-500 mt-2">M (32px)</p>
          </div>
          <div className="text-center">
            <Avatar initials="MK" size="l" />
            <p className="text-xs text-slate-500 mt-2">L (40px)</p>
          </div>
          <div className="text-center">
            <Avatar initials="?" />
            <p className="text-xs text-slate-500 mt-2">Bez inicjałów</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
