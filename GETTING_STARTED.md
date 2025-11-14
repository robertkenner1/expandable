# Getting Started with Article Expander

## 🚀 Quick Start (3 Steps)

### Step 1: Add Your OpenAI API Key
Open `.env.local` and add your key:
```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 2: Start the Server
```bash
npm run dev
```

### Step 3: Open the App
Go to [http://localhost:3000](http://localhost:3000)

---

## 📖 How to Use

### Home Page
You'll see two options:
- **Variation 1: Pre-loaded** - Instant expansion, slower initial load
- **Variation 2: On-Demand** - Fast initial load, delay on expansion

### Using Variation 1 (Pre-loaded)
1. Click "Try Variation 1"
2. Enter a topic (e.g., "The history of the internet")
3. Click "Generate Article"
4. Wait 10-20 seconds while all content loads
5. Move the slider left/right to instantly expand/collapse
6. Click "New Topic" to try another subject

### Using Variation 2 (On-Demand)
1. Click "Try Variation 2"
2. Enter a topic (e.g., "Climate change solutions")
3. Click "Generate Headline"
4. Wait 1-2 seconds for the headline
5. Move the slider right to expand (each level takes 1-2 seconds)
6. Click "New Topic" to try another subject

---

## 🎯 What to Expect

### Slider Positions
- **0** = Headline only (10-15 words)
- **5** = Medium article (250-300 words)
- **10** = Full article (1000-1100 words)

### Generation Times
- **Variation 1**: 10-20 seconds upfront, then instant
- **Variation 2**: 1-2 seconds per level

### Cost Estimates (per generation)
- **Variation 1**: ~11 API calls = $0.01-0.02
- **Variation 2**: 1-11 API calls (depending on usage) = $0.001-0.02

---

## ⚠️ Troubleshooting

### "Failed to generate content"
- Check your OpenAI API key in `.env.local`
- Ensure your OpenAI account has credits
- Verify your internet connection

### Build Errors
```bash
npm install  # Reinstall dependencies
npm run build  # Try building again
```

### Port Already in Use
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

---

## 💡 Tips

1. **Try Different Topics**: News, history, science, technology, etc.
2. **Compare Variations**: Use the same topic in both to see the difference
3. **Watch the Loading**: Notice how Variation 2 shows loading states
4. **Test Latency**: Move the slider quickly in Variation 2 to queue requests
5. **Experiment**: Try very specific or very broad topics

---

## 🎨 UI Features

All elements are styled with shadcn/ui:
- Clean, modern design
- Accessible components
- Smooth animations
- Loading states
- Error handling

---

## 📊 Understanding the Variations

### When to Use Variation 1
- Presenting to stakeholders
- Demonstrating smooth UX
- When latency is unacceptable
- Content will be fully consumed

### When to Use Variation 2
- Real-world applications
- Cost-sensitive scenarios
- When users may not expand fully
- Testing API latency

---

## 🔐 Security Notes

- Your API key is stored locally in `.env.local`
- The key is never sent to the browser
- All API calls happen server-side
- `.env.local` is gitignored automatically

---

## 📚 Learn More

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **OpenAI API**: [platform.openai.com/docs](https://platform.openai.com/docs)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)

---

## 🎉 You're Ready!

Start exploring the power of dynamic AI content expansion. Try both variations and see which approach works best for your use case!

