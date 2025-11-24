export const environment = {
  production: true,
  openaiApiKey: 'YOUR_OPENAI_API_KEY_HERE',
  togetherApiKey: 'YOUR_TOGETHER_API_KEY_HERE',
  geminiApiKey: 'YOUR_GEMINI_API_KEY_HERE',
  chatApiProvider: 'gemini' as 'openai' | 'together' | 'gemini',
  openaiApiUrl: 'https://api.openai.com/v1/chat/completions',
  togetherApiUrl: 'https://api.together.xyz/v1/chat/completions',
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
};

