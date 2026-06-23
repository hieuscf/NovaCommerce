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

## Environment variables

- `NEXT_PUBLIC_API_URL`: public Kong gateway URL (`http://localhost:8080/api/v1`)
- `IDENTITY_SERVICE_INTERNAL_URL`: server-side BFF URL cho route handlers (mac dinh trung `NEXT_PUBLIC_API_URL`)
- `NEXT_PUBLIC_APP_URL`: frontend app URL
- `NEXT_PUBLIC_DEFAULT_LOCALE`: locale mac dinh (`vi`)

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
- Client components chi goi Route Handlers (`/api/**`) theo BFF pattern
- Access token + refresh token luu trong httpOnly cookies
- Route Handlers goi Identity Service va tu refresh token khi gap `401`
- Auth store chi luu `user` + `isAuthenticated` (khong luu token)
- UI components theo shadcn/ui (`src/components/ui`)
