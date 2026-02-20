# Orbit

## Wymagania

- **Node** 20+
- **pnpm** (albo npm)
- **Docker** (baza PostgreSQL)

## Uruchomienie

```bash
docker compose up -d    # baza (PostgreSQL na :5432)
pnpm install
pnpm dev
```

- API: http://localhost:3000  
- Web: http://localhost:5173  

## Struktura

| Katalog        | Opis                    |
|----------------|-------------------------|
| `packages/api` | Backend (Express, Node) |
| `packages/web` | Frontend (Vite, React)  |

**Monorepo** — jedna komenda (`pnpm dev`) uruchamia api i web, wspólne zależności i konfiguracja (ESLint, Prettier) w root, współdzielone typy i konwencje w jednym miejscu.

## Konwencje

Zasady nazewnictwa (Redux, API, pliki, typy): **zobacz [docs/CONVENTIONS.md](docs/CONVENTIONS.md).**
