# Deployment Guide

## Prerequisites

- Node.js and pnpm installed
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project: cws-desc-generator
- Authenticated with Firebase: `firebase login`

## Quick Deploy (Both Backend and Frontend)

```bash
# From project root
firebase deploy
```

## Deploy Backend Only (Functions)

```bash
firebase deploy --only functions
```

Backend will be available at:
https://us-central1-cws-desc-generator.cloudfunctions.net/generate_description

## Deploy Frontend Only (Hosting)

```bash
# Build frontend first
cd frontend
pnpm install
pnpm build

# Deploy from project root
cd ..
firebase deploy --only hosting
```

Frontend will be available at your Firebase Hosting URL.

## Local Development

### Backend
```bash
cd functions
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
firebase emulators:start --only functions
```

Backend runs at: http://127.0.0.1:5001/cws-desc-generator/us-central1

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

Frontend runs at: http://localhost:3000

## Environment Configuration

### API Endpoint

The frontend automatically detects the environment:

Development (NODE_ENV=development):
- Uses: http://127.0.0.1:5001/cws-desc-generator/us-central1

Production (NODE_ENV=production):
- Uses: https://us-central1-cws-desc-generator.cloudfunctions.net

### Custom API URL

To override the default, create `.env.local` in the frontend directory:
```
NEXT_PUBLIC_API_URL=https://your-custom-url
```

## Build Configuration

Frontend is configured for static export:
- Output directory: `frontend/out`
- All pages are pre-rendered at build time
- No server-side rendering
- Optimized for Firebase Hosting

## Production Checklist

Before deploying:
- [ ] All changes committed to git
- [ ] Backend functions tested locally
- [ ] Frontend builds without errors: `cd frontend && pnpm build`
- [ ] Environment variables configured if needed

After deploying:
- [ ] Test the production URL
- [ ] Verify API calls work from production frontend
- [ ] Test keyword import functionality
- [ ] Test description generation
- [ ] Verify local storage persistence

## Troubleshooting

### Build fails
- Check Node.js version (should be 18+)
- Delete `frontend/node_modules` and `frontend/.next`
- Run `pnpm install` again

### API not connecting
- Check CORS headers in backend
- Verify Firebase Functions are deployed
- Check browser console for errors
- Verify API URL in production

### Static files not loading
- Check firebase.json hosting configuration
- Verify `frontend/out` directory exists after build
- Check Firebase Hosting deployment logs

