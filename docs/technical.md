# Technical Documentation

## Architecture Overview

Next.js frontend with Firebase Functions backend for keyword density analysis and spam risk detection.

## Stack

Frontend:
- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Local Storage for persistence

Backend:
- Firebase Functions (Python 3.13)
- NLTK for text processing
- Porter Stemmer for word normalization
- External spam detection API
- Structured logging

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              Main application
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── KeywordTable.tsx      Keyword display table
│   └── HighlightedTextArea.tsx  Text highlighting component
├── config/
│   └── api.ts                API configuration
├── hooks/
│   └── useLocalStorage.ts
├── types/
│   └── index.ts
└── utils/
    └── keywords.ts           Density color utilities

functions/
├── main.py                   API endpoints
├── services/
│   └── logging_config.py
└── test_main.py              Unit tests
```

## API Endpoints

### POST /analyze_text

Analyzes text for keyword density and phrase frequency.

Request format:
- text: string

Response format (camelCase):
- singleKeywords: array of keyword objects
- stopwords: array of stopword objects
- phrases: array of phrase objects
- totalWords: number
- uniqueWords: number

Keyword object:
- keyword: string
- density: number (percentage)
- timesUsed: number
- isStopword: boolean

Phrase object:
- phrase: string
- timesUsed: number

### POST /check_spam_risk

Assesses text spam risk using external API.

Request format:
- text: string

Response format:
- success: boolean
- risk: number
- level: string
- details: array
- link: string

CORS enabled for all origins with OPTIONS preflight support.

## Text Analysis Logic

### Preprocessing

1. Convert text to lowercase
2. Extract words using regex pattern
3. Apply Porter Stemmer to normalize words
4. Separate meaningful words from stopwords
5. Map stems back to shortest original word for display

### Keyword Extraction

Single keywords:
- Filter: count >= 2 AND density >= 0.8%
- Sorted by frequency descending
- Limited to top 10 results

Stopwords:
- Filter: count >= 2 AND density >= 0.8%
- Sorted by frequency descending
- Limited to top 10 results

Phrases:
- Generate bigrams from original word sequence preserving stopword positions
- Only count bigrams where both words are meaningful (not stopwords)
- This ensures phrases only count truly consecutive meaningful words
- Filter: count >= 2
- Sorted by frequency descending
- Limited to top 10 results

### Density Calculation

Density = (keyword_count / total_words) * 100

Rounded to 2 decimal places.

### Stemming

Uses Porter Stemmer to group related words:
- pdf and pdfs treated as same word
- data and database remain distinct
- Displays shortest original word in results

## Frontend Features

### Text Highlighting

Keywords with density >= 0.8% are highlighted in textarea:
- Background color based on density range
- Dotted underline matching density color
- Hover effect highlights all instances simultaneously
- Overlay technique with scroll synchronization

### Density Color Coding

Color ranges:
- 0-0.8%: No highlight
- 0.8-1.8%: Blue
- 1.8-2.8%: Yellow
- 2.8-3.8%: Orange
- 3.8%+: Red

Same colors applied to keyword table cells.

### Text Statistics

Displayed after analysis:
- Character count with spaces
- Character count without spaces
- Word count
- Unique word count

### Spam Risk Display

Collapsible section above keyword results:
- Risk score in points
- Risk level (translated from Russian)
- Detailed parameters with scores
- Independent of keyword analysis results

## Field Name Convention

Backend uses camelCase in JSON responses:
- singleKeywords
- totalWords
- uniqueWords
- timesUsed
- isStopword

Frontend uses camelCase throughout.

## Environment Variables

TURGENEV_API_KEY: Spam detection API key (configured as Firebase secret)

## Local Storage

Frontend stores application state in browser local storage.

State includes:
- Text input
- Analysis results
- Spam risk results

Auto-saves on every change.

## Analysis Flow

1. User inputs text in textarea
2. User clicks Analyze Keywords button
3. Frontend sends POST request to /analyze_text
4. Backend processes text with NLTK
5. Backend calculates keyword density and phrase frequency
6. Backend returns results in camelCase format
7. Frontend displays results in tables
8. Frontend highlights keywords in textarea
9. Frontend displays text statistics

## Spam Risk Flow

1. User clicks Check Spam Risk button
2. Frontend sends POST request to /check_spam_risk
3. Backend calls external API with text
4. Backend translates risk level from Russian to English
5. Backend returns risk assessment
6. Frontend displays in collapsible section

## Error Handling

Frontend:
- Try-catch around API calls
- Display error messages to user
- Clear errors on new attempt
- Separate error states for keyword and spam analysis

Backend:
- Validation errors return 400
- API errors return 500
- All errors return JSON with error field
- Structured logging for debugging

## Logging

Uses structured logging throughout backend.

Log levels:
- INFO: Successful operations
- WARNING: Validation failures
- ERROR: Analysis failures

Logs include context (text length, error details).

## Security Considerations

- API key stored as Firebase secret
- Input validation prevents injection
- No user authentication currently
- CORS enabled for all origins

## Performance

- Local storage provides instant saves
- Text analysis optimized with Counter
- No rate limiting implemented
- Frontend validation prevents unnecessary API calls

## API Configuration

Backend URL defined in frontend/config/api.ts.

Automatically detects environment:
- Development: http://127.0.0.1:5001/cws-desc-generator/europe-west3
- Production: https://europe-west3-cws-desc-generator.cloudfunctions.net

Environment variable override:
- NEXT_PUBLIC_API_URL: Override default API URL

## Production Build

Frontend configured for static export:
- Output: frontend/out directory
- All pages pre-rendered at build time
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

## Testing

Backend unit tests in functions/test_main.py:
- Text analysis logic tests
- Spam risk API integration tests
- Edge case handling tests

Run tests: python -m pytest functions/test_main.py

## Future Considerations

Rate limiting for production deployment.
Restrict CORS to specific origins in production.
API usage tracking.
Export functionality for analysis results.
Analytics integration.
