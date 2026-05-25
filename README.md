# 🕊️ Baptism Photo Sharing — Landing Page

A small React app built for a baptism celebration. Guests visit the page, get a warm welcome, and are guided to a shared Google Photos album where they can upload their own photos and videos from the event.

## What it does

- Displays a soft, animated landing page with the baby's name, photo, and baptism date
- Welcomes guests with a personal message
- Walks them through 3 simple steps to share their photos
- Has a single prominent button that opens the shared Google Photos album in a new tab — guests upload directly there

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Personalising it

Everything you need to change is at the top of `src/LandingPage.tsx`:

```ts
const ALBUM_URL   = "https://photos.app.goo.gl/YOUR_SHARED_ALBUM_LINK";
const BABY_NAME   = "Μαρία";
const BAPTISM_DATE = "1 Ιουνίου 2026";
const WELCOME_MESSAGE = "...";
```

To add the baby's photo, drop a file called `banner.jpg` into the `public/` folder.

## Building for production

```bash
npm run build       # outputs to dist/
npm run preview     # local preview of the production build
```

You can deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, etc.).

---

## Future ideas — Google Photos API integration

Right now guests are redirected to a shared album and upload from within Google Photos. A future version could go further:

- **Direct upload from the page** — use the [Google Photos Library API](https://developers.google.com/photos/library/guides/overview) to let guests pick a file on the landing page itself and upload it straight to the album without ever leaving the site. This needs an OAuth 2.0 flow (or a backend proxy holding the credentials so the key is never exposed to the browser).
- **Live photo wall** — poll or subscribe to the album and display a real-time mosaic of newly uploaded photos on the page, so guests can see their pictures appear during the event.
- **Server-side upload proxy** — a small Node/Express (or serverless function) endpoint that accepts a multipart upload from the browser, authenticates with a service-account token, and forwards the file to the Google Photos API. This avoids shipping OAuth secrets to the client.
- **QR code on printed invitations** — generate a QR code pointing to the deployed URL so guests can scan it on the day without typing anything.
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
