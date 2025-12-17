export const environment = {
  production: false,
  
  // API Configuration
  apiUrl: 'http://localhost:8000/api',
  
  // ============================================
  // CHATBOT API CONFIGURATION
  // ============================================
  // To enable the AI chatbot, add your API key below:
  //
  // Option 1: OpenAI (Recommended)
  // 1. Get your API key from: https://platform.openai.com/api-keys
  // 2. Replace 'YOUR_OPENAI_API_KEY_HERE' below with your actual key
  // 3. Set chatApiProvider to 'openai'
  //
  // Option 2: Together AI
  // 1. Get your API key from: https://api.together.xyz/
  // 2. Replace 'YOUR_TOGETHER_API_KEY_HERE' below with your actual key
  // 3. Set chatApiProvider to 'together'
  //
  // Example: openaiApiKey: 'sk-proj-abc123...',
  // ============================================
  
  openaiApiKey: 'YOUR_OPENAI_API_KEY_HERE',
  togetherApiKey: 'YOUR_TOGETHER_API_KEY_HERE',
  geminiApiKey: 'AIzaSyALIL0LuNbvUPA8zJM-Yz4aeuR53M6NVRc',
  // Choose which API to use: 'openai', 'together', or 'gemini'
  chatApiProvider: 'gemini' as 'openai' | 'together' | 'gemini',
  
  // API endpoints (usually don't need to change)
  openaiApiUrl: 'https://api.openai.com/v1/chat/completions',
  togetherApiUrl: 'https://api.together.xyz/v1/chat/completions',
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
};

