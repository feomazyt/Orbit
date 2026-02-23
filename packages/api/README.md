# Orbit API

Backend REST API (Express, Node) dla aplikacji Orbit — tablice Kanban (boards, listy, karty, komentarze).

## Uruchomienie

**Wymagania:** Node 20+, PostgreSQL (np. `docker compose up -d` w głównym katalogu repo).

```bash
pnpm install
pnpm dev
```

Serwer nasłuchuje na **http://localhost:3000**.

### Zmienne środowiskowe

| Zmienna                                                                               | Opis                                                                                |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                        | Connection string PostgreSQL, np. `postgresql://user:password@localhost:5432/orbit` |
| `JWT_SECRET`                                                                          | Sekret do podpisywania tokenów JWT (w produkcji obowiązkowo inny niż domyślny)      |
| `JWT_ACCESS_EXPIRES_IN`                                                               | (opcjonalnie) Czas życia tokena, domyślnie `1h`                                     |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Alternatywa do `DATABASE_URL` (MikroORM)                                            |

Przykład `.env` w katalogu głównym repo — zobacz `.env.example`.

---

## Autoryzacja

Endpointy (poza `/health` i `/auth/register`, `/auth/login`) wymagają **Bearer tokena** w nagłówku:

```
Authorization: Bearer <accessToken>
```

Token zwracany jest w odpowiedzi **POST /auth/register** i **POST /auth/login** w polu `token`. Brak lub nieprawidłowy token → **401 Unauthorized**.

---

## Endpointy

| Metoda       | Ścieżka                   | Opis                                                            |
| ------------ | ------------------------- | --------------------------------------------------------------- |
| **Health**   |                           |                                                                 |
| GET          | `/health`                 | Stan API (bez auth)                                             |
| **Auth**     |                           |                                                                 |
| POST         | `/auth/register`          | Rejestracja (email, password, name?)                            |
| POST         | `/auth/login`             | Logowanie (email, password)                                     |
| POST         | `/auth/logout`            | Wylogowanie (wymaga tokena)                                     |
| **Boards**   |                           |                                                                 |
| GET          | `/boards`                 | Lista tablic użytkownika (query: limit?, offset?, title?)       |
| POST         | `/boards`                 | Utworzenie tablicy (body: title, description?)                  |
| GET          | `/boards/:id`             | Pojedyncza tablica                                              |
| PUT          | `/boards/:id`             | Aktualizacja tablicy                                            |
| DELETE       | `/boards/:id`             | Usunięcie tablicy                                               |
| **Lists**    |                           |                                                                 |
| GET          | `/boards/:boardId/lists`  | Listy tablicy                                                   |
| POST         | `/boards/:boardId/lists`  | Utworzenie listy (body: title, position?)                       |
| PUT          | `/lists/:id`              | Aktualizacja listy                                              |
| PATCH        | `/lists/reorder`          | Zmiana kolejności list (body: [{ id, position }])               |
| DELETE       | `/lists/:id`              | Usunięcie listy                                                 |
| **Cards**    |                           |                                                                 |
| GET          | `/cards`                  | Karty listy (query: listId, limit?, offset?)                    |
| POST         | `/cards`                  | Utworzenie karty (body: title, listId, description?, position?) |
| GET          | `/cards/:id`              | Pojedyncza karta                                                |
| PATCH        | `/cards/:id`              | Aktualizacja karty                                              |
| POST         | `/cards/:id/move`         | Przeniesienie karty (body: listId, position)                    |
| DELETE       | `/cards/:id`              | Usunięcie karty                                                 |
| **Comments** |                           |                                                                 |
| GET          | `/cards/:cardId/comments` | Komentarze karty (query: limit?, offset?)                       |
| POST         | `/cards/:cardId/comments` | Dodanie komentarza (body: content)                              |
| PUT          | `/comments/:id`           | Edycja komentarza                                               |
| DELETE       | `/comments/:id`           | Usunięcie komentarza                                            |

Wszystkie `:id` / `:boardId` / `:cardId` to UUID. Nieprawidłowy lub cudzy zasób → **404 Not Found** (brak tokena → **401**).

---

## Testowanie (Postman / Insomnia)

Kolekcja z gotowymi requestami (zmienne `baseUrl`, `accessToken`; po login/register token zapisywany automatycznie):

- **[Orbit-API.postman_collection.json](../../docs/Orbit-API.postman_collection.json)** — import w Postman lub Insomnia.

Scenariusze w kolekcji: brak tokena (401), nieprawidłowy `boardId` (404).

---

## Przykłady curl

```bash
# Rejestracja
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"User"}'

# Login (zapisz token z odpowiedzi)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Lista tablic (podstaw TOKEN)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/boards

# Utworzenie tablicy
curl -X POST http://localhost:3000/boards \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Moja tablica","description":"Opis"}'
```
