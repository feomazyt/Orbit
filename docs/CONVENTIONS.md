# Konwencje — nazewnictwo

Dokument opisuje przyjęte w projekcie Orbit konwencje nazewnictwa (Redux, API, pliki, typy).

---

## Redux

- **Slice’y:** nazwa w formacie `xyzSlice` (np. `boardsSlice`, `authSlice`).
- **Akcje:** generowane przez `createSlice` — używamy domyślnych nazw z slice’a (np. `boardsSlice.actions.addBoard`, `authSlice.actions.setUser`).

---

## API

- **Trasy (routes):** w **liczbie mnogiej**.
  - Przykłady: `GET /boards`, `POST /boards`, `GET /boards/:boardId/lists`, `POST /boards/:boardId/lists`, `GET /boards/:boardId/cards`.
- **Serwisy:** nazwa encji + `Service`, PascalCase (np. `BoardService`, `AuthService`, `ListService`).

---

## Pliki

| Rodzaj              | Konwencja   | Przykład                    |
|---------------------|------------|-----------------------------|
| Komponenty React    | PascalCase | `BoardCard.tsx`, `ListColumn.tsx` |
| Slice’y Redux       | camelCase  | `boardSlice.ts`, `authSlice.ts`   |
| Hooki               | camelCase  | `useBoard.ts`, `useAuth.ts`       |
| Stałe (konfig)      | UPPER_SNAKE | w plikach konfiguracyjnych  |

---

## Typy

- **Lokalizacja:** typy współdzielone w `shared/types` lub w pakiecie `@orbit/types` (przygotowanie pod Fazę 1–2).
- **Nazwy:** interfejsy/typy takie same jak w API — **Board**, **Card**, **List** itd.
- Cel: jedna definicja typu dla frontendu i API (współdzielone typy).
