# Chatbot Setup Guide

## Overview
The University Accounting System includes a fully functional AI chatbot that helps users with financial questions, system navigation, and general inquiries.

## API Configuration

### Step 1: Choose an API Provider

You can use either **OpenAI** or **Together AI**:

- **OpenAI**: Get your API key from https://platform.openai.com/api-keys
- **Together AI**: Get your API key from https://api.together.xyz/

### Step 2: Configure API Key

1. Open `src/environments/environment.ts`
2. Replace `YOUR_OPENAI_API_KEY_HERE` or `YOUR_TOGETHER_API_KEY_HERE` with your actual API key
3. Set `chatApiProvider` to either `'openai'` or `'together'`

Example:
```typescript
export const environment = {
  production: false,
  openaiApiKey: 'sk-your-actual-openai-key-here',
  togetherApiKey: 'your-actual-together-key-here',
  chatApiProvider: 'openai', // or 'together'
  // ... rest of config
};
```

### Step 3: Test the Chatbot

1. Start the development server: `npm start`
2. Open the chat widget (bottom-right corner)
3. Send a test message like "How do I view my invoices?"
4. The chatbot should respond with helpful information

## Features

- ✅ Real-time AI responses using external API
- ✅ Chat history persistence (localStorage)
- ✅ Auto-scroll to latest messages
- ✅ Loading indicators
- ✅ Error handling with user-friendly messages
- ✅ Financial assistant system prompt
- ✅ Supports questions about:
  - Student fees and invoices
  - Payment processes
  - Budget management
  - Payroll
  - System navigation
  - General financial guidance

## Troubleshooting

### "API key not configured" Error
- Make sure you've added your API key in `environment.ts`
- Check that the key doesn't contain `YOUR_` placeholder text
- Verify the `chatApiProvider` matches your chosen service

### "Rate limit exceeded" Error
- You've hit the API rate limit
- Wait a moment and try again
- Consider upgrading your API plan if this happens frequently

### "Invalid API key" Error
- Double-check your API key is correct
- Ensure there are no extra spaces or characters
- Verify the key is active in your API provider dashboard

## Security Note

⚠️ **Important**: API keys are stored in the frontend code. For production, consider:
- Using environment variables
- Implementing a backend proxy to hide API keys
- Using server-side API calls instead of direct frontend calls

