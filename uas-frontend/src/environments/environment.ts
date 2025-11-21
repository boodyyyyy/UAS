export const environment = {
  production: false,
  
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
  
  // Choose which API to use: 'openai' or 'together'
  chatApiProvider: 'openai' as 'openai' | 'together',
  
  // API endpoints (usually don't need to change)
  openaiApiUrl: 'https://api.openai.com/v1/chat/completions',
  togetherApiUrl: 'https://api.together.xyz/v1/chat/completions'
};

