# Input Requirements Specification

## Frontend & Backend Validation Rules

### Extension Name
- **Field**: `extensionName`
- **Type**: String
- **Required**: Yes
- **Min Length**: 3 characters
- **Max Length**: 75 characters
- **Validation**: Both frontend and backend
- **Error Message**: "extension_name must be between 3 and 75 characters"

### Short Description
- **Field**: `shortDescription`
- **Type**: String
- **Required**: Yes
- **Min Length**: 10 characters
- **Max Length**: 132 characters
- **Validation**: Both frontend and backend
- **Error Message**: "short_description must be between 10 and 132 characters"
- **Note**: This follows Chrome Web Store short description requirements

### Main Keywords
- **Field**: `mainKeywords`
- **Type**: Array of strings
- **Required**: No (empty array allowed)
- **Validation**: Backend validates it's an array type
- **Usage in Generation**: Should appear 15-20 times total in generated description
- **Individual Main Keyword**: 7-10 times each
- **Variations**: Main keyword variations should appear 7-10 times

### Extra Keywords
- **Field**: `extraKeywords`
- **Type**: Array of strings
- **Required**: No (empty array allowed)
- **Validation**: Backend validates it's an array type
- **Usage in Generation**: Should appear 15-20 times total in generated description

### System Prompt
- **Field**: `systemPrompt`
- **Type**: String
- **Required**: No (uses default if not provided)
- **Default**: Predefined prompt optimized for Chrome extension descriptions
- **Frontend**: Collapsible section (hidden by default)
- **Customization**: User can modify for different tones or requirements

### Generated Text
- **Field**: `generatedText`
- **Type**: String
- **Max Length**: 16,000 characters
- **Target Length**: ~4,500 characters
- **Frontend Limit**: 16,000 characters (maxLength attribute)
- **Note**: Chrome Web Store allows up to 16,000 characters for detailed description

## API Request Format

```json
{
  "extensionName": "string (3-75 chars)",
  "shortDescription": "string (10-132 chars)",
  "mainKeywords": ["keyword1", "keyword2"],
  "extraKeywords": ["extra1", "extra2"],
  "systemPrompt": "string (optional)"
}
```

## API Response Format

### Success (200)
```json
{
  "description": "Generated description text..."
}
```

### Error (400/500)
```json
{
  "error": "Error message describing what went wrong"
}
```

## Generation Rules

### Content Structure
- **Paragraphs**: 10-16 paragraphs
- **Paragraph Length**: Maximum 4-5 lines, shorter is better
- **Lists**: Use at least 5 different list types
  - Numbered lists
  - Bullet points
  - Emoji lists with numbers
  - Different bullet point characters
- **Emojis**: Maximum one per line for structure
- **FAQ**: Optional FAQ section
- **Quotation Marks**: Not allowed

### Keyword Distribution
- Main keywords distributed throughout text
- Extra keywords used naturally
- Keywords counted even when part of longer phrases
  - Example: "task" counts in both "task" and "task manager"

### Style Requirements
- Human-written feel
- SEO-optimized
- Natural keyword integration
- Professional tone
- Clear value propositions

## Chrome Web Store Limits (Reference)

- **Name**: Up to 75 characters
- **Short Description**: Up to 132 characters
- **Detailed Description**: Up to 16,000 characters
- **Recommended**: Keep detailed description under 5,000 characters for readability

## Validation Flow

1. **Frontend Validation** (Immediate)
   - Real-time character counting
   - Visual validation feedback
   - Disable submit button if invalid

2. **Backend Validation** (On Submit)
   - Verify required fields exist
   - Validate string lengths
   - Verify data types
   - Return specific error messages

3. **Generation**
   - Process keywords and inputs
   - Call OpenAI API
   - Apply generation rules
   - Return formatted description

