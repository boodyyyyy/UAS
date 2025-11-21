export const environment = {
  production: true,
  openaiApiKey: 'YOUR_OPENAI_API_KEY_HERE',
  togetherApiKey: 'YOUR_TOGETHER_API_KEY_HERE',
  chatApiProvider: 'openai' as 'openai' | 'together',
  openaiApiUrl: 'https://api.openai.com/v1/chat/completions',
  togetherApiUrl: 'https://api.together.xyz/v1/chat/completions'
};

