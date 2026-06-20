# Web Store (Customer Frontend)

Web Store la frontend Next.js cho customer trong he thong NovaCommerce.

## Prerequisites

- Node.js 20+
- npm 10+

## Run local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ung dung mac dinh chay tai `http://localhost:3000`.

## Scripts

- `npm run dev`: Chay development server
- `npm run build`: Build production
- `npm run start`: Chay production server
- `npm run lint`: Lint code voi ESLint
- `npm run format`: Format code voi Prettier
- `npm run type-check`: Kiem tra TypeScript

## Structure

```text
frontend/web-store
├── messages
├── src
│   ├── app
│   │   ├── [locale]
│   │   ├── api
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components
│   │   ├── common
│   │   └── ui
│   ├── hooks
│   ├── i18n
│   ├── lib
│   │   ├── api
│   │   ├── store
│   │   └── utils
│   ├── styles
│   └── types
└── ...
```

## Conventions

- App Router + locale segment (`/[locale]`)
- API response format: `{ data, meta, error }`
- Access token attach qua axios interceptor
- Refresh token flow qua `/auth/refresh` khi gap `401`
- Auth state luu trong zustand, token duoc persist qua API route de set httpOnly cookie
- UI components theo shadcn/ui (`src/components/ui`)
