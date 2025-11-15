# Provocative AI UX: What If Documents Knew What You'd Write Next?

*An experiment in predictive content generation, progressive disclosure, and the future of AI-assisted writing.*

---

## The Real Problem

At Superhuman, we're thinking about the future of documents. Not just "better text editors" - but fundamentally different surfaces where AI is a true collaborator, not just a chatbot in the sidebar.

The question we keep coming back to: **How can AI be genuinely predictive instead of just reactive?**

Most AI writing tools wait for you to ask. You type a prompt, hit enter, wait. It's request-response. There's no anticipation, no preparation, no sense that the AI "gets" where you're going.

But what if it did?

**What if the AI pre-loaded the entire landscape of what you might write, before you even knew you needed it?**

That's what this experiment explores.

---

## The Hypothesis

If you're writing a document about a topic - say, "The History of Typography" - a truly predictive AI would:

1. **Generate the full context immediately** (not just a paragraph at a time)
2. **Understand the depth you need** (headline? summary? comprehensive essay?)
3. **Adapt in real-time** as you signal your intent through interaction

The key insight: **Pre-generation enables prediction.**

If the AI already knows what a full 1,000-word essay looks like, it's in a better position to help you write it. It can:
- Suggest the next paragraph because it knows where the argument goes
- Pull in relevant details from level 7 when you're writing at level 4
- Restructure on the fly because it understands the complete structure
- Anticipate questions because it's already explored the full depth

**But how do you make "content depth" something a user can control?**

---

## The Prototype: Expandable

**→ [Live Demo](https://github.com/robertkenner1/expandable)**

I built a slider that takes you from a one-sentence headline to a full 1,000-word essay in 10 steps. The entire article is pre-generated when you load the page.

**Try it yourself:**
1. The page loads with a headline (slider at position 0)
2. Slide right to expand through 10 levels of detail
3. Notice when you feel like you "get it" - that's your comprehension threshold

The content is AI-generated (GPT-4o-mini) with coherence across all granularities. More importantly: **it's all pre-loaded**.

---

## Why Pre-Loading Matters

This is the difference between reactive and predictive AI:

### Reactive (traditional):
```
User slides to level 5
→ Request sent to AI
→ Wait 1-2 seconds
→ Content appears
→ User slides to level 6
→ Repeat
```

Result: Every interaction has latency. The AI is always catching up.

### Predictive (this experiment):
```
Page loads
→ AI generates all 10 levels (10-15 seconds)
→ User slides anywhere instantly
→ AI "knows" the full landscape
→ No waiting, pure exploration
```

Result: The AI is already there, waiting for you. It knows what you'll need before you do.

**This is the bet:** If documents could pre-generate the "possibility space" of what you might write, AI assistance becomes anticipatory instead of reactive.

---

## The Craft

The interaction design needed to embody this concept of "depth revealing itself." I drew heavy inspiration from [Rauno Freiberg's work](https://devouringdetails.com/) - a Staff Design Engineer at Vercel who's at the absolute top of his craft in motion and interaction design.

Rauno's philosophy: **Every pixel matters. Every transition has intent.**

Here's how I applied that thinking:

### Loading State: The AI "Thinking"
A single pulsing dot that grows/shrinks (2px → 6px). It breathes. It signals: "I'm generating the entire landscape for you."

Why a pulse? Because it's organic. The AI isn't just computing - it's *preparing* something for you.

### Transition: Materialization
When loading completes, the dot doesn't just disappear. It finishes its breath, then explodes into 10 dots that slide into position.

Why this matters: The dots aren't "loading" then "interactive" - they're the *same dots* transforming. The AI's preparation becomes your tool.

### Interaction: Depth as a Physical Thing
- Dots at rest: 2px circles (potential depth)
- Hover: 5px vertical lines (teasing selection)  
- Selected: 10px vertical line (full depth revealed)

The vertical line isn't just decoration - it's a **metaphor for depth**. As you slide, you're literally pulling more content out of the system.

### The Details That Took 15+ Iterations:
- Dots expand horizontally from a collapsed state (not randomly appearing)
- Transitions use easing curves that feel physical (not linear)
- Hover states preview selection before commitment
- The slider width (170px) is sized so dots feel intentionally placed
- Font size scales inversely (4rem → 1rem) so more content feels denser
- Line height tightens at larger sizes to maintain rhythm

**Why did this take so long?** Because if the interface feels mechanical, the concept doesn't land. The smoothness of the interaction reinforces the idea: *depth is something you control fluidly, not something that loads in chunks.*

### Content Reveal: Making New Information Tangible

One detail I'm particularly proud of: **when you slide forward, only the newly revealed text flashes blue before fading to black.**

This turned out to be surprisingly tricky. My first attempts:

**Iteration 1:** Applied the blue animation to the entire content div.  
*Problem:* Everything turned blue, not just the new content. Disorienting.

**Iteration 2:** Used CSS classes to toggle the animation on the whole block.  
*Problem:* The `text-foreground` class was overriding the animation. Still all blue.

**Iteration 3:** Split content into "old" and "new" at the character level.  
*Problem:* Lost paragraph formatting. Everything rendered as a single line.

**Final solution:** Track the previous content length, then intelligently split paragraphs:
- Paragraphs entirely from old content: stay black
- Paragraphs entirely new: animate from blue to black
- Paragraphs that span the boundary: split mid-paragraph, only animate the new portion

Why this matters: The blue flash **draws your eye to exactly what changed**. It reinforces the mental model that you're revealing hidden depth, not replacing the whole text. The content is layered, and you're peeling back layers.

This is a micro-interaction most users won't consciously notice. But they'll *feel* it - a brief flash that says "here's what's new" before settling into the reading experience.

---

## What I Learned

### On Predictive AI:
- **Pre-generation is expensive but powerful** - 10-15 seconds upfront for instant exploration
- **Coherence across levels is possible** with structured prompting (specific word counts per level)
- **The model needs full context** to maintain consistency from headline to essay
- **This pattern could scale** - imagine pre-generating outlines, talking points, research notes

### On UX:
- **Making abstract concepts tangible requires iteration** - "depth" became a slider after many attempts
- **Micro-interactions build trust** - smooth animations signal the system is in control
- **Loading states are critical** - users need to know pre-generation is happening
- **The interface should embody the concept** - the slider *is* the metaphor for progressive disclosure

### On Documents:
- **People don't know what depth they need until they see it**
- **The slider position is implicit intent** - where you stop reveals your comprehension threshold
- **Sliding back and forth is exploration** - users testing their understanding
- **There's probably a "sweet spot" around 300-500 words** where most people feel they "get it"

---

## Why This Matters for AI Document Surfaces

This isn't just a demo. It's a potential pattern for the future of AI-assisted writing:

**For document editing:**
Imagine drafting an email. The AI pre-generates:
- Short version (3 sentences)
- Medium version (2 paragraphs)  
- Detailed version (full context)

You slide to adjust tone/depth. The AI already knows what you might say at any level, so it can:
- Suggest transitions between depths
- Pull in details from the fuller version when you need them
- Restructure on the fly because it understands the complete arc

**For research:**
You're writing about a complex topic. The AI pre-generates:
- ELI5 explanation
- Surface-level overview
- Technical deep-dive

As you write, it suggests content from the appropriate depth based on your current paragraph's complexity.

**For collaboration:**
Multiple people viewing the same doc could each control their own depth slider. The CEO sees the executive summary. The engineer sees the implementation details. Same doc, adaptive depth.

**The core insight:** AI's ability to generate content at arbitrary granularities + pre-generation + user control = **truly predictive document surfaces**.

---

## Open Questions

I haven't user-tested this yet, but here's what I want to explore next:

1. **Does pre-generation time (10-15s) feel worth it?** Or is it too much friction?
2. **What's the optimal number of levels?** (Probably not 10)
3. **Can the system predict which level you'll need** based on reading patterns?
4. **How does this scale to long documents?** (Multiple sliders per section?)
5. **What if the slider was continuous** (0-100) instead of discrete steps?
6. **Could you "bookmark" certain depths** for later reference?

---

## Try It, Break It, Remix It

The code is open source: **[github.com/robertkenner1/expandable](https://github.com/robertkenner1/expandable)**

Built with:
- Next.js 16 (App Router)
- OpenAI API (GPT-4o-mini)
- shadcn/ui components
- Custom animations inspired by [Rauno's craft](https://devouringdetails.com/)

If you're exploring provocative AI UX, I'd love to see what you build.

---

## Final Thought

The best AI experiences don't just respond to requests - they **anticipate what you'll need and prepare it before you ask.**

This slider doesn't just expand content. It reveals what's possible when AI is predictive instead of reactive. When the system already knows the full landscape, interaction becomes exploration.

That's the future I'm excited about: **Documents that know what you're going to write, before you write it.**

Not because they're reading your mind - but because they've already imagined every possibility, and they're waiting for you to choose.

---

*Robert Kenner · Design at [Superhuman](https://superhuman.com) · 2025*  
*Inspired by [Rauno Freiberg's](https://devouringdetails.com/) craft · [GitHub](https://github.com/robertkenner1/expandable)*

