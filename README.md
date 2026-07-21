# Contacts — Management Dashboard

A small, production-structured **Angular 22** single-page app for a customer-service
representative to browse contacts and view their details. It fetches live data
from a mock backend (mockapi.io), matching the provided Figma design.

Built with **TypeScript, HTML and SCSS**. No UI component library is used
(no Angular Material / PrimeNG / ng-bootstrap and no third-party table or
pagination modules) — the layout, list and details are all hand-built.

---

## Features

- **Master–detail layout** — contact list on the left, selected contact's details
  on the right (matches the Figma).
- **Live data** from the mock backend:
  - `GET /contacts` — the full list.
  - `GET /email_addresses?contactId={id}` — a contact's email addresses.
- **Search** by name, email or phone (client-side, instant).
- **Responsive** — side-by-side on desktop/tablet; on mobile it becomes a
  list → details → back flow.
- **Resilience** — one automatic retry on transient failures, a friendly error
  state with a **Retry** button, avatar fallback to initials if an image fails,
  and an email fallback so the details panel is never blank.
- **Unit tests** for the service and both components (Vitest).

---

## Getting started

**Prerequisites:** Node.js 20+ and npm.

```bash
npm install        # install dependencies
npm start          # dev server at http://localhost:4200
npm run build      # production build into dist/
npm test           # run unit tests once (Vitest)
```

---

## Backend configuration

The base URL is provided via a DI token so it is defined in exactly one place and
is easy to swap per environment or in tests.

- Token: `src/app/core/tokens/api-base-url.token.ts`
- Value: `src/app/app.config.ts`

```ts
{ provide: API_BASE_URL, useValue: 'https://<your-project>.mockapi.io/api' }
```

The mockapi.io project must expose two resources:

| Resource          | Fields                                                              |
| ----------------- | ------------------------------------------------------------------ |
| `contacts`        | `id, firstName, lastName, address, phone, email, bio, profileImage` |
| `email_addresses` | `id, contactId, email, type`                                        |

> **Note on the endpoint shape.** The brief specifies
> `GET /contacts/{id}/email_addresses`. In this mockapi project `email_addresses`
> is a top-level resource, so the equivalent working request is
> `GET /email_addresses?contactId={id}`. This detail is isolated inside
> `ContactService.getEmailAddresses()` — switching to a truly nested route later
> is a one-line change there.

---

## Architecture

```
src/app/
├─ core/                         # framework-agnostic building blocks
│  ├─ models/contact.model.ts    # Contact & EmailAddress interfaces
│  ├─ services/contact.service.ts# HTTP data-access layer (+ spec)
│  └─ tokens/api-base-url.token.ts
├─ components/
│  ├─ contact-list/              # presentational list (left panel) (+ spec)
│  └─ contact-details/           # presentational details (right panel) (+ spec)
├─ app.ts / app.html / app.scss  # smart "shell" container (+ spec)
├─ app.config.ts                 # providers (HttpClient, router, base URL)
└─ app.routes.ts
```

**Design decisions**

- **Smart container + presentational children.** `App` owns data loading and the
  current selection; `contact-list` and `contact-details` receive plain inputs and
  emit outputs. This keeps the children reusable and trivial to test (no HTTP).
- **Stateless service (repository pattern).** `ContactService` only performs HTTP
  calls and returns typed models — no view state lives in it.
- **Signals** (`signal`, `computed`, `input`, `output`) for reactive state, and the
  modern control flow (`@if` / `@for`) in templates.
- **Design tokens** as CSS custom properties in `styles.scss`, so the palette lives
  in one place and every component reads it via `var(--token)`.

---

## Tech

Angular 22 · TypeScript · SCSS · RxJS · Vitest
