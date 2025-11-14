# Article Expander

A minimalist demo application that explores dynamic AI content expansion using OpenAI. The app features a clean single-page interface with dynamic text scaling and two variations you can toggle between.

## Features

### Single-Page Experience
- **Random topic generation** - Each page refresh picks a new random topic
- **Dynamic text scaling** - Text starts at 4rem (headline) and scales down to 1rem (full article)
- **Bottom toolbar** - Simple controls without cluttering the content
- **Toggle between modes** - Switch between pre-loaded and on-demand generation
- **Minimal UI** - Only the text content is displayed, no containers or extra elements

### Variation 1: Pre-loaded Mode
- Generates all 11 levels of content (from headline to full article) at once
- Instant expansion with no latency when moving the slider
- Best for demonstrating smooth UX with pre-cached content

### Variation 2: On-Demand Mode
- Generates content dynamically as you move the slider
- Tests real-time AI generation and latency
- Best for understanding the performance characteristics of dynamic content

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your OpenAI API key:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   Replace `your_openai_api_key_here` with your actual OpenAI API key.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Open the app - a random topic is automatically generated
2. Watch as content is generated (Pre-loaded mode by default)
3. Use the slider in the bottom toolbar to expand from headline (0) to full article (10)
4. Toggle between Pre-loaded and On-demand modes to compare approaches
5. Refresh the page to get a new random topic

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first styling
- **OpenAI API** - AI content generation with GPT-4o-mini

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── generate/          # On-demand content generation
│   │   └── generate-full/     # Pre-loaded content generation
│   └── page.tsx               # Main app with both variations
├── components/
│   └── ui/                    # shadcn/ui components
│       ├── slider.tsx         # Range slider
│       ├── toggle.tsx         # Mode toggle button
│       └── ...                # Other UI components
└── .env.local                 # Environment variables (create this)
```

## API Routes

### POST /api/generate
Generates content for a specific expansion level (0-10).

**Request:**
```json
{
  "topic": "The history of artificial intelligence",
  "level": 5
}
```

**Response:**
```json
{
  "content": "Generated article content..."
}
```

### POST /api/generate-full
Generates all 11 levels of content at once.

**Request:**
```json
{
  "topic": "The history of artificial intelligence"
}
```

**Response:**
```json
{
  "levels": [
    { "level": 0, "content": "Headline..." },
    { "level": 1, "content": "Brief summary..." },
    ...
  ]
}
```

## Notes

- The app uses GPT-4o-mini for cost-effective content generation
- Content length increases progressively from ~10 words (headline) to ~1000 words (full article)
- Variation 1 makes 11 parallel API calls on initial generation
- Variation 2 makes individual API calls as needed

## License

MIT
