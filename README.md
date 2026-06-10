# 🎨 Artchive

A digital archive for your kids' artwork and schoolwork. Snap a photo of
whatever comes home in the backpack, tap your kid's face, and it's saved
forever — browsable in a Pinterest-style gallery with ages, grades, and tags.

## What's in v1

- **Accounts** — email/password or Google sign-in (Firebase Auth)
- **Kid profiles** — name, photo, birthday, and school years with teacher names
- **Uploads** — pick multiple photos or use the phone camera; the date defaults
  to today and is editable later for older art
- **Gallery** — masonry tile board with infinite scroll; tap any piece to
  lightbox it with details like *"Campbell · age 8 · 3rd grade"* (computed from
  the birthday and the date the art came home)
- **Tags** — tag pieces with things like `3rd grade` or `halloween`, then tap a
  tag (or the "Explore 3rd grade →" button) to see a filtered board
- **Per-kid pages** — tap a kid's face on the homepage for their archive

## Tech stack

React (JavaScript) + Vite, with Firebase for everything server-side:
Auth, Firestore, Storage, and Hosting. No Cloud Functions needed yet —
images are resized client-side (a full-size copy plus a small thumbnail for
the gallery) before upload.

### Data model (Firestore)

```
users/{uid}                    family doc; holds the reusable tag list
users/{uid}/profiles/{id}      kid profiles (name, birthday, photo, schoolYears[])
users/{uid}/artworks/{id}      one doc per piece:
                                 profileIds[]  ← the profile↔picture join table
                                 tags[]        ← the tag↔photo join table
                                 dateOfWork, note, image/thumb URLs + paths
```

The many-to-many joins from a relational design become arrays queried with
`array-contains`, so "all of Campbell's art" and "everything tagged halloween"
are each a single indexed query.

## One-time Firebase setup (you need to do this)

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com)
   (any name, e.g. `artchive`). The free Spark plan works; the Blaze plan is
   only needed if you outgrow free Storage quotas.
2. **Add a Web app** (Project settings → General → Your apps → `</>`). Copy the
   config values it shows you.
3. **Enable services** in the console:
   - *Authentication* → Sign-in method → enable **Email/Password** and **Google**
   - *Firestore Database* → Create database (production mode)
   - *Storage* → Get started
4. **Local config:** copy `.env.example` to `.env.local` and paste in the
   values from step 2. (`.env.local` is gitignored. These values are not
   secrets in the usual sense — they ship in the JS bundle; the security rules
   are what protect the data.)
5. **Deploy rules + indexes** (uses `firestore.rules`, `storage.rules`, and
   `firestore.indexes.json` from this repo):
   ```sh
   npm install -g firebase-tools
   firebase login
   firebase use --add        # pick your project, alias "default"
   firebase deploy --only firestore,storage
   ```

## Run it locally

```sh
npm install
npm run dev
```

## Deploy to Firebase Hosting

Manually:

```sh
npm run build
firebase deploy --only hosting
```

Or automatically on every push to `main` via the included GitHub Action
(`.github/workflows/deploy.yml`). For that, add these **repository secrets**
(GitHub → Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `VITE_FIREBASE_API_KEY` … `VITE_FIREBASE_APP_ID` | the six values from `.env.example` |
| `FIREBASE_SERVICE_ACCOUNT` | JSON for a service account with the *Firebase Hosting Admin* role (console → Project settings → Service accounts → Generate new private key) |

## Ideas for later

- AI auto-tagging (this looks like a Christmas drawing → tag `christmas`)
- Explore stories: "Halloween through the years", "watch the handwriting improve"
- Year/grade summary pages and photo books
- Print products: stickers, mugs, shirts, blankets from any piece or collage
