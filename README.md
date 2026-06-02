# 🕊️ Baptism Photo Sharing — Landing Page

A React app for a baptism celebration. Guests visit the page, pick photos or videos from their device, and upload them directly to a Google Photos album — no Google account required on their end, no redirects, no friction.

## How it works

```
Guest browser  →  POST /api/upload (multipart)
                        ↓
               Vercel Serverless Function
                        ↓  (uses your stored refresh token)
               Google Photos Library API
                        ↓
               Photos land in your album ✓
```

The frontend never touches any credentials. The serverless function — which runs in the same Vercel project as the React app — holds your OAuth refresh token as an environment variable and uploads on behalf of your account.

**Cost: free.** Vercel's Hobby plan (free forever) includes more than enough serverless execution time for a one-day event.

---

## What guests see

- Soft animated landing page with the baby's name, photo, and baptism date
- A drag-and-drop / tap-to-select upload area
- Per-file upload progress with ✓ / ✕ status indicators
- A "Thank you" confirmation once all files are uploaded

---

## Personalising the page

Edit the constants at the top of `src/LandingPage.tsx`:

```ts
const BABY_NAME      = "Μαρία";
const BAPTISM_DATE   = "1 Ιουνίου 2026";
const WELCOME_MESSAGE = "...";
```

To add the baby's photo, drop a file called `banner.jpg` into the `public/` folder.

---

## One-time Google setup

You only need to do this once before the event.

### 1. Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and create a new project.
2. Enable the **Google Photos Library API** for that project.
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Choose **Desktop app** as the application type.
5. Note the **Client ID** and **Client Secret**.

### 2. Get a refresh token

Run this one-time script (replace the placeholders):

```bash
node -e "
const params = new URLSearchParams({
  client_id: 'YOUR_CLIENT_ID',
  redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
  response_type: 'code',
  scope: 'https://www.googleapis.com/auth/photoslibrary',
  access_type: 'offline',
  prompt: 'consent',
});
console.log('Open this URL:\nhttps://accounts.google.com/o/oauth2/auth?' + params);
"
```

Open the printed URL in your browser, approve access, copy the **authorization code**, then exchange it:

```bash
curl -s -X POST https://oauth2.googleapis.com/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d code=AUTHORIZATION_CODE \
  -d redirect_uri=urn:ietf:wg:oauth:2.0:oob \
  -d grant_type=authorization_code
```

The response contains your **`refresh_token`** — save it somewhere safe.

### 3. Create the album

The album **must be created through this same OAuth app** (not manually in Google Photos) for the API to be able to write to it:

```bash
curl -s -X POST https://photoslibrary.googleapis.com/v1/albums \
  -H "Authorization: Bearer ACCESS_TOKEN_FROM_ABOVE" \
  -H "Content-Type: application/json" \
  -d '{"album":{"title":"Βάπτιση Μαρίας"}}'
```

Note the **`id`** field in the response — that is your `GOOGLE_ALBUM_ID`.

---

## Deploying to Vercel (free)

### 1. Install the Vercel CLI

```bash
npm i -g vercel
```

### 2. Set environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_ALBUM_ID=...
```

### 3. Deploy

```bash
vercel          # first deploy — follow the prompts
vercel --prod   # subsequent deploys to production
```

Vercel will pick up `.env.local` for preview deployments. For production, add the same variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

That's it. Your site is live at `https://your-project.vercel.app`.

---

## Local development

To test the upload API locally you need Vercel's dev server (it emulates the serverless runtime):

```bash
npm install -g vercel   # if not already installed
vercel dev              # starts on http://localhost:3000
```

To work on just the UI without the API:

```bash
npm run dev   # Vite dev server on http://localhost:5173
```

---

## Future ideas

- **Live photo wall** — poll the album and show a real-time mosaic of newly uploaded photos so guests can see themselves appear on a screen during the event.
- **QR code on printed invitations** — link directly to the deployed URL so guests can scan it without typing anything.
- **Email/SMS notification** — trigger a message to the family each time a new photo arrives.
- **Video size warning** — detect large video files client-side and warn before uploading (Vercel free tier has a 50 MB request body limit).
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
