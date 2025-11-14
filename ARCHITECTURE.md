# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Home Page │  │ Variation 1 │  │ Variation 2 │          │
│  │    (/)     │  │   (pages)   │  │   (pages)   │          │
│  └─────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│        │                 │                 │                 │
└────────┼─────────────────┼─────────────────┼─────────────────┘
         │                 │                 │
         │                 │                 │
┌────────┼─────────────────┼─────────────────┼─────────────────┐
│        │    Next.js Server (App Router)    │                 │
│        │                 │                 │                 │
│        │         ┌───────┴────────┬────────┴──────┐          │
│        │         │                │               │          │
│        │    ┌────▼─────┐    ┌────▼──────┐        │          │
│        │    │   API:   │    │   API:    │        │          │
│        │    │ generate │    │ generate- │        │          │
│        │    │          │    │   full    │        │          │
│        │    └────┬─────┘    └────┬──────┘        │          │
│        │         │                │               │          │
│        │         └────────┬───────┘               │          │
│        │                  │                       │          │
│  ┌─────▼──────────────────▼───────────────────────▼──────┐  │
│  │              OpenAI SDK Client                        │  │
│  │         (API Key from .env.local)                     │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             │ HTTPS
                             │
                    ┌────────▼─────────┐
                    │   OpenAI API     │
                    │  (GPT-4o-mini)   │
                    └──────────────────┘
```

## Component Flow

### Variation 1: Pre-loaded Flow

```
User Input
    │
    ├─> Enter Topic
    │
    ├─> Click "Generate Article"
    │
    ├─> POST /api/generate-full
    │       │
    │       ├─> Make 11 parallel OpenAI API calls
    │       │   (one for each level: 0-10)
    │       │
    │       ├─> Wait for all to complete
    │       │
    │       └─> Return array of 11 content levels
    │
    ├─> Store all levels in React state
    │
    └─> User moves slider
            │
            └─> Instantly display level from state
                (no API call needed)
```

### Variation 2: On-Demand Flow

```
User Input
    │
    ├─> Enter Topic
    │
    ├─> Click "Generate Headline"
    │
    ├─> POST /api/generate (level: 0)
    │       │
    │       ├─> Make 1 OpenAI API call
    │       │
    │       └─> Return headline content
    │
    ├─> Store headline in React state
    │
    └─> User moves slider to level N
            │
            ├─> Show loading state
            │
            ├─> POST /api/generate (level: N)
            │       │
            │       ├─> Make 1 OpenAI API call
            │       │
            │       └─> Return level N content
            │
            └─> Update state with new content
```

## Data Flow

### Request Structure

```typescript
// Variation 1: Generate Full
POST /api/generate-full
Body: {
  topic: string  // e.g., "The history of AI"
}

Response: {
  levels: [
    { level: 0, content: "..." },
    { level: 1, content: "..." },
    ...
    { level: 10, content: "..." }
  ]
}

// Variation 2: Generate Single Level
POST /api/generate
Body: {
  topic: string,  // e.g., "The history of AI"
  level: number   // 0-10
}

Response: {
  content: string
}
```

## State Management

### Variation 1 State

```typescript
{
  topic: string                    // User input
  sliderValue: [number]           // Current slider position (0-10)
  articleLevels: ArticleLevel[]   // All 11 pre-loaded levels
  isLoading: boolean              // Generation in progress
  hasGenerated: boolean           // Content ready to display
}
```

### Variation 2 State

```typescript
{
  topic: string                // User input
  sliderValue: [number]       // Current slider position (0-10)
  currentContent: string      // Currently displayed content
  isLoading: boolean          // Initial generation in progress
  hasGenerated: boolean       // Headline ready
  isGeneratingLevel: boolean  // Level generation in progress
}
```

## API Route Implementation

### /api/generate-full
- Receives topic
- Creates 11 prompts (one per level)
- Makes 11 parallel OpenAI API calls using `Promise.all()`
- Returns all levels at once
- Used by Variation 1

### /api/generate
- Receives topic and level
- Creates single prompt for requested level
- Makes 1 OpenAI API call
- Returns single content string
- Used by Variation 2

## Security Architecture

```
┌──────────────────────────────────────────┐
│          Browser (Client)                │
│  - No API key access                     │
│  - Makes requests to Next.js API routes  │
│  - Receives only generated content       │
└────────────┬─────────────────────────────┘
             │
             │ HTTP Request
             │
┌────────────▼─────────────────────────────┐
│       Next.js API Routes (Server)        │
│  - Reads OPENAI_API_KEY from .env.local  │
│  - Makes authenticated OpenAI API calls  │
│  - Returns sanitized responses           │
└────────────┬─────────────────────────────┘
             │
             │ HTTPS (with API key)
             │
┌────────────▼─────────────────────────────┐
│           OpenAI API                     │
│  - Validates API key                     │
│  - Generates content                     │
│  - Returns completion                    │
└──────────────────────────────────────────┘
```

## Component Hierarchy

```
app/
├── layout.tsx (Root Layout)
│   └── page.tsx (Home Page)
│       ├── Button (shadcn/ui)
│       └── Card (shadcn/ui)
│
├── pages/variation1/page.tsx
│   ├── Card (shadcn/ui)
│   ├── Input (shadcn/ui)
│   ├── Label (shadcn/ui)
│   ├── Button (shadcn/ui)
│   └── Slider (shadcn/ui)
│
└── pages/variation2/page.tsx
    ├── Card (shadcn/ui)
    ├── Input (shadcn/ui)
    ├── Label (shadcn/ui)
    ├── Button (shadcn/ui)
    └── Slider (shadcn/ui)
```

## Performance Characteristics

### Variation 1
| Metric | Value |
|--------|-------|
| Initial Load | 10-20 seconds |
| Slider Response | Instant (<50ms) |
| API Calls | 11 upfront |
| Memory Usage | Higher (stores all levels) |
| Network Usage | Higher upfront |

### Variation 2
| Metric | Value |
|--------|-------|
| Initial Load | 1-2 seconds |
| Slider Response | 1-2 seconds per level |
| API Calls | 1-11 (on-demand) |
| Memory Usage | Lower (stores current only) |
| Network Usage | Lower, distributed |

## Technology Stack Layers

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  - React Components                 │
│  - shadcn/ui                        │
│  - Tailwind CSS                     │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│        Application Layer            │
│  - Next.js App Router               │
│  - TypeScript                       │
│  - Client/Server Components         │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│          API Layer                  │
│  - Next.js API Routes               │
│  - OpenAI SDK                       │
│  - Error Handling                   │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│        External Services            │
│  - OpenAI API (GPT-4o-mini)        │
└─────────────────────────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────┐
│         Vercel / Hosting             │
│                                      │
│  ┌────────────────────────────────┐ │
│  │   Next.js Application          │ │
│  │   - Static Pages               │ │
│  │   - API Routes (Serverless)    │ │
│  └────────────────────────────────┘ │
│                                      │
│  Environment Variables:              │
│  - OPENAI_API_KEY (secure)          │
└──────────────────────────────────────┘
```

## Error Handling Flow

```
User Action
    │
    ├─> API Request
    │       │
    │       ├─> Validation Error?
    │       │   └─> Return 400 + Error Message
    │       │
    │       ├─> OpenAI API Error?
    │       │   └─> Return 500 + Generic Error
    │       │
    │       └─> Success
    │           └─> Return 200 + Content
    │
    └─> Display Result or Error
```

