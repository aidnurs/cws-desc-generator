# Technical Documentation

## Architecture Overview

Next.js frontend with Firebase Functions backend using OpenAI API for description generation.

## Stack

Frontend:
- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Local Storage for persistence

Backend:
- Firebase Functions (Python 3.13)
- OpenAI API (GPT-4.1)
- JSON Schema validation
- Structured logging

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              Main application
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── KeywordTable.tsx      Keyword management
│   └── CSVImport.tsx
├── config/
│   └── api.ts                API configuration
├── hooks/
│   └── useLocalStorage.ts
├── types/
│   └── index.ts
└── utils/
    └── keywords.ts

functions/
├── main.py                   API endpoint
└── services/
    ├── logging_config.py
    ├── prompt.py
    └── validation.py         JSON Schema validation
```

## API Endpoint

Endpoint: POST /generate_description

CORS enabled for all origins with OPTIONS preflight support.

Request format (snake_case):
- extension_name: string (3-75 chars)
- short_description: string (10-132 chars)
- main_keywords: array of strings
- extra_keywords: array of strings
- user_prompt: string (optional)

Response: JSON with description field

API URL configured in frontend/config/api.ts with environment variable support.

## Validation Architecture

Uses JSON Schema (Draft 7) for request validation.

Location: functions/services/validation.py

Key features:
- Centralized validation logic
- Type checking
- Length validation
- User-friendly error messages
- Extensible schema

Schema defined in REQUEST_SCHEMA constant with minLength, maxLength, type constraints.

Validation function returns tuple: (is_valid: bool, error_message: str)

## Field Name Convention

Backend uses snake_case following Python conventions:
- extension_name
- short_description
- main_keywords
- extra_keywords
- user_prompt

Frontend converts from camelCase to snake_case when making API calls.

## Environment Variables

OPENAI_KEY: OpenAI API key (configured as Firebase secret)

## Local Storage

Frontend stores complete application state in browser local storage.

State includes:
- Keywords (main and extra)
- Extension name and description
- User prompt
- Generated text

Auto-saves on every change.

## Keyword Counting

Tracks keyword occurrences in generated text using regex matching.

Counts partial matches (e.g., "task" in "task manager" counts for both).

Updates automatically when text changes.

## Generation Flow

1. User fills extension details and keywords
2. Frontend validates input lengths
3. Submit triggers API call with snake_case fields
4. Backend validates using JSON Schema
5. Constructs system and user prompts
6. Calls OpenAI API (GPT-4.1)
7. Returns generated description
8. Frontend displays and auto-saves

## Validation Flow

Frontend validation:
- Real-time character counting
- Visual feedback for invalid inputs
- Disable submit when invalid

Backend validation:
- JSON Schema validation
- Empty string checks
- Type validation
- Returns specific error messages

## Logging

Uses structured logging throughout backend.

Log levels:
- INFO: Successful operations
- WARNING: Validation failures
- ERROR: Generation failures

Logs include context (extension name, error details).

## Error Handling

Frontend:
- Try-catch around API calls
- Display error messages to user
- Clear errors on new attempt
- Modal confirmation for destructive actions

Backend:
- Validation errors return 400
- API errors return 500
- All errors return JSON with error field

## Prompt Engineering

System prompt defines:
- Content structure (10-16 paragraphs)
- Text formatting rules
- Keyword usage requirements
- Writing style guidelines
- SEO best practices

User prompt provides:
- Extension details
- Keyword lists
- Generation instructions

Target output: 4500 characters

## Security Considerations

- API key stored as Firebase secret
- Input validation prevents injection
- No user authentication currently
- CORS enabled for all origins

## Performance

- Local storage provides instant saves
- Keyword counting optimized with regex
- No rate limiting implemented
- Frontend validation prevents unnecessary API calls

## API Configuration

Backend URL defined in frontend/config/api.ts.

Automatically detects environment:
- Development: http://127.0.0.1:5001/cws-desc-generator/us-central1
- Production: https://us-central1-cws-desc-generator.cloudfunctions.net

Environment variable override:
- NEXT_PUBLIC_API_URL: Override default API URL

## Production Build

Frontend configured for static export:
- Output: frontend/out directory
- All pages pre-rendered at build time
- Optimized images (unoptimized for static export)
- No server-side rendering

Firebase Hosting serves static files from frontend/out.

Build command: pnpm build

Deploy command: firebase deploy --only hosting

## Deployment

Manual deployment to Firebase:
- Backend: firebase deploy --only functions
- Frontend: firebase deploy --only hosting
- Both: firebase deploy

See DEPLOYMENT.md for detailed instructions.

## Future Considerations

Rate limiting for production deployment.
Restrict CORS to specific origins in production.
API key usage tracking.
Shareable links with Firestore storage.
Analytics integration.

