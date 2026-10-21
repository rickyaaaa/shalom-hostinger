# Hostinger Node.js deployment

This folder is the deployable root for the Shalom Next.js app.

Hostinger settings:

- Node.js: 20.9 or newer
- Build command: `npm run build`
- Start command: `npm start`
- Application root: this folder (the folder containing `package.json`)

Set the required environment variables in Hostinger before starting the app. Do not commit `.env.local` or production secrets.
