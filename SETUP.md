# Quick Setup Guide

## 1. Add Your OpenAI API Key

Open the `.env.local` file and replace the placeholder with your actual OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Where to get your API key:**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key and paste it into `.env.local`

## 2. Start the Development Server

```bash
npm run dev
```

## 3. Open the App

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 4. Try Both Variations

- **Variation 1**: Pre-loads all content levels at once (11 API calls upfront)
- **Variation 2**: Loads content on-demand as you move the slider (1 API call per level)

## Notes

- The app uses GPT-4o-mini which is cost-effective
- Variation 1 will take 10-20 seconds to generate all levels
- Variation 2 will take 1-2 seconds per level as you move the slider
- Make sure your OpenAI account has available credits

