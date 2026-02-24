# Faza 2: Frontend — Specyfikacja UI dla projektanta

Dokument opisuje wszystkie widoki, komponenty, kolorystykę i wymagania UX potrzebne do zaprojektowania i wdrożenia frontendu aplikacji Kanban (Orbit) w Fazie 2. Brak drag & drop — nawigacja i edycja przez kliknięcia, modale, formularze.

---

## 1. Przegląd widoków (screens)

| # | Widok | Trasa (React Router) | Opis |
|---|--------|----------------------|------|
| 0 | **Hero (landing)** | `/` (tylko dla niezalogowanych) | Strona powitalna: hasło, CTA „Zaloguj” / „Zarejestruj”, krótka prezentacja produktu |
| 1 | **Logowanie** | `/login` | Formularz: email, hasło, przycisk „Zaloguj”, link do rejestracji |
| 2 | **Rejestracja** | `/register` | Formularz: email, hasło, potwierdzenie hasła, przycisk „Zarejestruj”, link do logowania |
| 3 | **Lista tablic** | `/boards` (dla zalogowanych) | Dashboard: nagłówek, lista tablic użytkownika, przycisk „Nowa tablica” |
| 4 | **Widok tablicy (Kanban)** | `/boards/:boardId` | Tablica: nazwa, kolumny (listy), karty w kolumnach, dodawanie list/kart |
| 5 | **Modal karty** | overlay na tablicy | Szczegóły karty: tytuł, opis, komentarze, ewent. metadane (data, etykiety — jeśli API to obsługuje) |
| 6 | **Stany pomocnicze** | — | Loading, puste listy/tablice, błędy (toasty), 404 |

**Routing:** Dla użytkownika niezalogowanego trasa `/` pokazuje Hero; po zalogowaniu `/` może przekierować na `/boards`. Chronione trasy: `/boards`, `/boards/:boardId` — wymagają zalogowania.

Poniżej każdy widok jest rozpisany szczegółowo + kolorystyka i design system.

---

## 2. Widok 0: Hero — strona powitalna (`/`, tylko niezalogowany)

**Cel:** Pierwszy kontakt z produktem. Przedstawienie Orbit, zachęta do rejestracji lub logowania. Żadnych danych aplikacji — tylko przekaz marketingowy i wejście do auth.

**Elementy na ekranie:**

- **Navbar (góra):**
  - **Logo / nazwa** „Orbit” (link do `/` lub scroll na górę).
  - Po prawej: przycisk **„Zaloguj się”** (secondary/ghost) → `/login`, przycisk **„Zarejestruj się”** (primary) → `/register`.

- **Sekcja hero (główna):**
  - **Headline (H1):** Krótkie, mocne hasło, np. „Zarządzaj zadaniami w jednym miejscu”, „Tablice Kanban dla Twojego zespołu”, „Proste tablice. Realna współpraca.”
  - **Subheadline (podtytuł):** 1–2 zdania wyjaśniające wartość (np. „Twórz tablice, listy i karty. Współpracuj na żywo. Bez zbędnych komplikacji.”).
  - **CTA (call-to-action):**
    - Główny: **„Utwórz konto”** lub **„Zacznij za darmo”** → `/register`.
    - Drugoplanowy: **„Mam już konto”** lub link „Zaloguj się” → `/login`.

- **Wizualizacja / preview produktu (opcjonalnie, zalecane):**
  - Mockup tablicy Kanban (zrzut ekranu, ilustracja lub uproszczony wireframe): kilka kolumn z kartami, żeby od razu było widać, o co chodzi.
  - Może być w ramce, z lekkim cieniem lub „laptopowym” kadrem. Na mobile: uproszczona wersja lub ukryta / mniejsza.

- **Opcjonalnie — sekcja „Features” (krótka):**
  - 3–4 ikonki + krótkie hasła, np. „Tablice Kanban”, „Karty i komentarze”, „Współpraca w czasie rzeczywistym” (nawet jeśli real-time jest w późniejszej fazie — można zapowiedzieć). Jedna linijka pod każdą ikoną.

**Layout:**
- Hero: wycentrowany pionowo i poziomo (lub treść wyrównana do lewej, wizualizacja w prawo — klasyczny split). Max-width treści np. 600–720px; wizualizacja obok lub pod spodem (stack na mobile).
- Pełna wysokość viewport (min-height: 100vh) dla sekcji hero lub nieco mniej, jeśli od razu jest blok features.
- Tło: jednolity kolor (np. `#f8fafc`), delikatny gradient (np. od białego do `#f1f5f9`) lub bardzo subtelna tekstura — bez rozpraszania od headline i CTA.

**Kolorystyka:** Spójna z resztą aplikacji: primary dla głównego CTA, secondary/ghost dla „Zaloguj”. Headline w kolorze tekstu głównego (`#0f172a`), subheadline w secondary (`#64748b`).

**Stany:** Brak specjalnych (strona statyczna). Hover na przyciskach według design systemu.

**Responsywność:** Na mobile navbar może być uproszczony (hamburger z „Zaloguj” / „Zarejestruj”), headline mniejszy, CTA w jednej kolumnie, wizualizacja pod tekstem lub mniejsza.

---

## 3. Widok 1: Logowanie (`/login`)

**Cel:** Zalogowanie użytkownika (email + hasło). Po sukcesie przekierowanie na listę tablic.

**Elementy na ekranie:**
- **Logo / nazwa aplikacji** (np. „Orbit”) — góra, wycentrowane lub w lewym górnym rogu.
- **Nagłówek:** „Zaloguj się” (H1).
- **Formularz:**
  - Pole **Email** (type email, wymagane).
  - Pole **Hasło** (type password, wymagane).
  - Opcjonalnie: „Zapamiętaj mnie”, „Zapomniałem hasła” (można zostawić na później).
- **Przycisk:** „Zaloguj się” (primary CTA).
- **Link:** „Nie masz konta? Zarejestruj się” → `/register`.
- **Komunikat błędu:** pod formularzem lub nad przyciskiem, np. „Nieprawidłowy email lub hasło” (czerwony / error color).

**Layout:** Wycentrowana karta (max-width ok. 400px) na pełnym ekranie lub na tle (gradient / tekstura). Formularz w jednej kolumnie, pola pełnej szerokości.

**Stany:** default, loading (przycisk disabled + spinner), error (komunikat), success (redirect).

---

## 4. Widok 2: Rejestracja (`/register`)

**Cel:** Utworzenie konta. Po sukcesie przekierowanie na logowanie lub od razu na listę tablic (zależnie od product decision).

**Elementy:**
- Logo / nazwa aplikacji.
- Nagłówek: „Utwórz konto”.
- **Formularz:**
  - **Email** (wymagane).
  - **Hasło** (wymagane, min. długość — np. 8 znaków — opcjonalnie wskaźnik siły).
  - **Potwierdź hasło** (wymagane, musi się zgadzać).
- Przycisk: „Zarejestruj się”.
- Link: „Masz już konto? Zaloguj się” → `/login`.
- Komunikat błędu (walidacja lub błąd z API, np. „Email jest już używany”).

**Layout:** Jak logowanie — wycentrowana karta, jedna kolumna.

**Stany:** default, loading, error, success.

---

## 5. Widok 3: Lista tablic (`/` lub `/boards`)

**Cel:** Pokazanie wszystkich tablic użytkownika, wejście w tablicę, utworzenie nowej.

**Elementy:**
- **Header (navbar):**
  - Logo / „Orbit” (link do `/boards`).
  - Po prawej: avatar/initials użytkownika lub email, menu (wyloguj).
- **Treść:**
  - Tytuł sekcji: „Moje tablice” (lub „Tablice”).
  - Przycisk: „+ Nowa tablica” (wyraźny, primary).
  - **Siatka lub lista tablic:** każda tablica to karta (card) z:
    - Nazwa tablicy (link do `/boards/:boardId`).
    - Opcjonalnie: miniatura podglądu / kolor tła (jak w Trello).
    - Opcjonalnie: ikona „ustawienia” / menu (edycja nazwy, usunięcie) — można uprościć do samego kliknięcia w nazwę.
- **Stan pusty:** Gdy brak tablic: ilustracja lub ikona + tekst „Nie masz jeszcze tablic. Utwórz pierwszą.” + przycisk „Utwórz tablicę”.

**Layout:** Siatka kart (np. 3–4 kolumny na desktopie), responsywność: tablet 2 kolumny, mobile 1 kolumna. Odstępy między kartami (np. 16–24px).

---

## 6. Widok 4: Tablica Kanban (`/boards/:boardId`)

**Cel:** Główny widok pracy — kolumny (listy) z kartami. Bez drag & drop: dodawanie przez przyciski, edycja w miejscu lub w modalu.

**Elementy:**
- **Header tablicy:**
  - Nazwa tablicy (edytowalna in-place lub przez modal — np. klik w nazwę).
  - Po prawej: powrót do listy tablic („← Tablice” lub ikona), opcjonalnie menu tablicy (ustawienia, usunięcie).
- **Obszar kolumn (list):**
  - **Kolumny w poziomie** (scroll horizontalny, jeśli wiele list).
  - Jedna **kolumna (lista)** zawiera:
    - **Nagłówek listy:** tytuł listy (edytowalny in-place), opcjonalnie menu (usuń listę, zmień nazwę).
    - **Lista kart:** pionowo, każda karta to klikalny blok (otwiera modal karty).
    - **Przycisk:** „+ Dodaj kartę” na dole listy (rozwiń formularz: pole tytułu + Zapisz / Anuluj).
  - **Przycisk:** „+ Dodaj listę” (ostatnia „kolumna” lub pasek po prawej) — po kliku pole do wpisania nazwy listy + Zapisz / Anuluj.
- **Karta (preview na tablicy):**
  - Tytuł karty (jedna linia, ewent. obcięcie z „…”).
  - Opcjonalnie: ikonki (np. liczba komentarzy, załączniki) — jeśli API to zwraca.

**Layout:**
- Kolumny: stała lub min-width (np. 272px), równa wysokość, scroll pionowy wewnątrz kolumny jeśli dużo kart.
- Tło: jednolity kolor lub delikatna tekstura (jak Trello — np. niebieski/zielony gradient lub zdjęcie). Nagłówek tablicy może być półprzezroczysty lub w kontrastowym pasku.

**Stany:** ładowanie tablicy (skeleton lub spinner), pusta lista (tylko „+ Dodaj kartę”), błąd (toast lub banner).

---

## 7. Widok 5: Modal karty (overlay)

**Cel:** Szczegóły jednej karty: tytuł, opis, komentarze. Wszystko edytowalne / dodawalne.

**Elementy:**
- **Overlay:** półprzezroczyste tło (np. rgba(0,0,0,0.5)), klik poza modalem zamyka (lub przycisk X).
- **Okno modalu:** wycentrowane, max-width (np. 600px), scroll wewnętrzny przy długiej treści.
- **Nagłówek modalu:**
  - Tytuł karty (input lub H2, edytowalny in-place).
  - Przycisk zamknięcia (X).
  - Opcjonalnie: w podtytule „W liście: [nazwa listy]”.
- **Sekcje (bloki):**
  - **Opis:** pole tekstowe (textarea) lub „Dodaj opis” jeśli puste. Zapisywanie przy blurze lub przyciskiem „Zapisz”.
  - **Komentarze:**
    - Lista komentarzy: avatar/initials autora, treść, data (np. „Jan K. · 2 min temu”). Kolejność: najnowsze na dole lub na górze (spójnie w całej aplikacji).
    - Pole „Dodaj komentarz” + przycisk „Wyślij” (lub Enter). Po wysłaniu komentarz pojawia się na liście.
- Opcjonalnie (jeśli API wspiera w Fazie 2): **Data terminu**, **Etykiety** — można pominąć lub dodać jako „Coming soon”.

**Stany:** ładowanie karty, pusty opis, brak komentarzy, błąd zapisu (toast).

---

## 8. Stany pomocnicze

- **Loading (cała strona):** Spinner wycentrowany lub skeleton (np. szkielet listy tablic / szkielet kolumn).
- **Loading (fragmenty):** Przy zapisie karty/komentarza — disabled przyciski lub mały spinner przy przycisku.
- **Puste listy/tablice:** Tekst + CTA (jak w „Lista tablic” i „Dodaj kartę” w pustej kolumnie).
- **Błędy:** Toasty (np. react-hot-toast): sukces (zielony), błąd (czerwony), info (niebieski). Krótki tekst, auto-ukrycie po 3–5 s.
- **404:** Strona „Nie znaleziono” z linkiem „Wróć do tablic”.
- **Brak dostępu (401):** Przekierowanie na `/login` z opcjonalnym toastem „Zaloguj się, aby kontynuować”.

---

## 9. Kolorystyka i design system

### 9.1 Paleta kolorów (propozycja — do dopasowania do brandu)

- **Primary (akcent, CTA, linki):** np. `#2563eb` (niebieski) lub `#0d9488` (teal). Używane dla: przyciski primary, linki, aktywne stany.
- **Primary hover:** przyciemnienie o ~10% (np. `#1d4ed8`).
- **Secondary / neutral:** szarości dla tła i obramowań:
  - Tło strony: `#f8fafc` lub `#f1f5f9`.
  - Tło kart/panel: `#ffffff`.
  - Obramowanie: `#e2e8f0`, `#cbd5e1`.
  - Tekst główny: `#0f172a` lub `#1e293b`.
  - Tekst drugoplanowy: `#64748b`, `#94a3b8`.
- **Success:** `#22c55e` (toasty sukcesu, potwierdzenia).
- **Error:** `#dc2626` lub `#ef4444` (błędy walidacji, toasty błędów).
- **Warning:** `#f59e0b` (opcjonalnie).
- **Tło tablicy (opcjonalnie):** gradient lub obrazek w tle (np. `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` lub zdjęcie z overlay).

### 9.2 Typografia

- **Font:** Bezszeryfowy (np. Inter, system-ui, albo charakterystyczny jak „DM Sans”, „Plus Jakarta Sans”).
- **Nagłówki:** H1 ok. 24–28px, H2 20–22px, H3 16–18px, font-weight 600–700.
- **Body:** 14–16px, line-height 1.5.
- **Małe / metadata:** 12–13px, kolor secondary.

### 9.3 Odstępy i siatka

- Bazowa jednostka: **4px** lub **8px**. Odstępy: 8, 16, 24, 32px.
- Zaokrąglenia: karty/ przyciski 6–8px, modal 8–12px, inputy 6px.
- Cienie: delikatne (np. `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` dla kart), mocniejsze dla modal (np. `0 10px 40px rgba(0,0,0,0.15)`).

### 9.4 Komponenty do zdefiniowania

- **Przycisk:** primary (wypełniony), secondary (outline), ghost (bez obramowania), danger (usuwanie). Rozmiary: S / M / L (wysokość np. 32 / 40 / 48px).
- **Input / Textarea:** wysokość (np. 40px), stan focus (obramowanie primary), error (obramowanie error), placeholder (kolor secondary).
- **Karta (card):** tło białe, border lub cień, padding 16px, border-radius 8px.
- **Modal:** overlay + box z max-width, padding 24px, przycisk X w rogu.
- **Toast:** mały box w rogu (np. bottom-right), ikona + tekst, auto-hide.
- **Avatar:** koło z inicjałami lub obrazkiem, rozmiary S/M/L (24 / 32 / 40px).

---

## 10. Responsywność

- **Desktop:** pełna nawigacja, siatka tablic 3–4 kolumny, Kanban z poziomym scrollem kolumn.
- **Tablet:** 2 kolumny na liście tablic, tablica Kanban — 2–3 kolumny widoczne, reszta scroll.
- **Mobile:** 1 kolumna listy tablic; na tablicy Kanban — jedna kolumna lub przewijanie poziome; modal karty na pełnym ekranie lub prawie pełnym (łatwiejsze klikanie). Menu użytkownika w hamburgerze jeśli potrzeba.

---

## 11. Dostępność (a11y)

- Kontrast tekstu względem tła min. 4.5:1 (WCAG AA).
- Focus widoczny (outline lub box-shadow) na przyciskach i polach.
- Formularze: etykiety powiązane z inputami (label + id), komunikaty błędów powiązane z polami (aria-describedby).
- Modal: focus trap, zamknięcie Escape, przywrócenie focusu po zamknięciu.

---

## 12. Podsumowanie checklist dla projektanta

- [ ] Ekrany: **Hero (landing)**, Logowanie, Rejestracja, Lista tablic, Tablica Kanban, Modal karty.
- [ ] Stany: loading, puste, błąd, 404.
- [ ] Paleta: primary, secondary, success, error, tła, tekst.
- [ ] Typografia: font, rozmiary H1–H3, body, small.
- [ ] Komponenty: przycisk (warianty), input, textarea, karta, modal, toast, avatar.
- [ ] Odstępy i zaokrąglenia (design tokens).
- [ ] Responsywność: breakpointy i zachowanie listy tablic + Kanban + modal.
- [ ] Dostępność: kontrast, focus, etykiety formularzy.

Po zaprojektowaniu można dodać mockupy (Figma/Sketch) i przekazać devom lub zaimplementować w Tailwind/CSS według tej specyfikacji.
