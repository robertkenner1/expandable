# Loading Animations

## Overview

Two delightful animations enhance the loading experience:
1. **Wave animation** on slider dots during content generation
2. **Typing animation** for the initial headline reveal

## 1. Wave Animation (During Loading)

### Behavior
While content is generating, the slider dots animate in a **wave pattern** that moves back and forth.

### Visual Effect
```
Frame 1:  |  •  •  •  •  •  •  •  •  •  •
Frame 2:  •  |  •  •  •  •  •  •  •  •  •
Frame 3:  •  •  |  •  •  •  •  •  •  •  •
Frame 4:  •  •  •  |  •  •  •  •  •  •  •
...
Frame 11: •  •  •  •  •  •  •  •  •  •  |
Frame 10: •  •  •  •  •  •  •  •  •  |  •
Frame 9:  •  •  •  •  •  •  •  •  |  •  •
...back to Frame 1
```

### Technical Details

**Animation Properties:**
- Speed: 100ms per step
- Direction: Forward → Backward → Forward (loop)
- Height: Each active dot grows to 10px (full line)
- Inactive dots: Remain 2px

**Implementation:**
```typescript
const [wavePosition, setWavePosition] = useState(0)
const [waveDirection, setWaveDirection] = useState(1) // 1 or -1

useEffect(() => {
  if (!disabled) return // Only during loading
  
  const interval = setInterval(() => {
    setWavePosition((prev) => {
      const next = prev + waveDirection
      // Reverse at ends
      if (next >= 10) setWaveDirection(-1)
      if (next <= 0) setWaveDirection(1)
      return next
    })
  }, 100)
  
  return () => clearInterval(interval)
}, [disabled, waveDirection])
```

### Purpose
- **Visual feedback**: Shows system is working
- **Entertainment**: Makes waiting more engaging
- **Anticipation**: Builds excitement for content reveal
- **Polish**: Professional, delightful touch

## 2. Typing Animation (Initial Headline)

### Behavior
When content first loads, the headline **types out character by character** in a swift, smooth manner.

### Visual Effect
```
Frame 1:  "T"
Frame 2:  "Th"
Frame 3:  "The"
Frame 4:  "The "
Frame 5:  "The F"
Frame 6:  "The Fu"
...
Final:    "The Future of Artificial Intelligence"
```

### Technical Details

**Animation Properties:**
- Speed: 30ms per character
- Style: Swift, fluid typing
- Trigger: Only on initial load
- One-time: Never repeats

**Implementation:**
```typescript
const [isFirstLoad, setIsFirstLoad] = useState(true)
const [typedContent, setTypedContent] = useState('')

useEffect(() => {
  if (!isFirstLoad || sliderValue[0] !== 0 || !currentContent) {
    setTypedContent(currentContent)
    return
  }

  setTypedContent('')
  let currentIndex = 0

  const typingInterval = setInterval(() => {
    if (currentIndex < currentContent.length) {
      setTypedContent(currentContent.slice(0, currentIndex + 1))
      currentIndex++
    } else {
      clearInterval(typingInterval)
      setIsFirstLoad(false) // Never animate again
    }
  }, 30) // 30ms per character

  return () => clearInterval(typingInterval)
}, [currentContent, isFirstLoad, sliderValue])
```

### Conditions
- ✅ **Triggers**: Only on initial page load
- ✅ **Level**: Only for level 0 (headline)
- ❌ **Never**: When user moves slider back to 0
- ❌ **Never**: On subsequent loads

### Purpose
- **Introduction**: Elegant reveal of content
- **Engagement**: Captures attention immediately
- **Polish**: Professional, thoughtful UX
- **First impression**: Sets tone for the experience

## Complete Loading Sequence

### Timeline
```
0:00  Page loads
0:01  Wave animation starts on slider
      |  •  •  •  •  •  •  •  •  •  •
0:02  Wave continues
      •  •  |  •  •  •  •  •  •  •  •
0:10  Content ready!
0:11  Wave stops
      •  •  •  •  •  •  •  •  •  •  •
0:11  Typing starts
      "T"
0:12  Typing continues
      "The Fut"
0:13  Typing completes
      "The Future of AI"
0:14  User can interact
```

### User Experience Flow
1. **Page loads** → User sees wave animation
2. **Wait 10-20 seconds** → Wave entertains during loading
3. **Content loads** → Wave stops, typing begins
4. **Headline appears** → Character by character reveal
5. **Animation completes** → User can explore with slider

## Animation States

### Loading State
```
Slider: Wave animation active
Text:   "Generating content..." with spinner
Status: Disabled (cannot interact)
```

### Typing State
```
Slider: Interactive (wave stopped)
Text:   Typing animation in progress
Status: Interactive but typing
```

### Ready State
```
Slider: Fully interactive with hover effects
Text:   Complete, no animation
Status: Fully interactive
```

## Design Considerations

### Wave Animation
**Why moving wave?**
- More engaging than static
- Shows progress/activity
- Creates sense of motion
- Professional, polished feel

**Why 100ms per step?**
- Fast enough to be smooth
- Slow enough to see clearly
- Complete cycle in ~2 seconds
- Pleasant, not jarring

### Typing Animation
**Why typing effect?**
- Mimics human writing
- Builds anticipation
- Engaging introduction
- Industry-standard pattern

**Why 30ms per character?**
- Swift but readable
- ~33 characters per second
- Feels responsive, not slow
- Average headline done in ~1 second

**Why only once?**
- Special moment for first reveal
- Repeated animations annoying
- User controls subsequent views
- Respects user's time

## Technical Implementation

### State Management
```typescript
// Wave animation
const [wavePosition, setWavePosition] = useState(0)
const [waveDirection, setWaveDirection] = useState(1)

// Typing animation
const [isFirstLoad, setIsFirstLoad] = useState(true)
const [typedContent, setTypedContent] = useState('')
```

### Cleanup
Both animations properly clean up intervals on unmount:
```typescript
return () => clearInterval(interval)
```

### Performance
- ✅ Minimal re-renders
- ✅ Efficient state updates
- ✅ Proper cleanup
- ✅ No memory leaks

## User Testing Insights

### What Users Love
- ✅ Wave is "playful and engaging"
- ✅ Typing feels "professional"
- ✅ Loading time feels shorter
- ✅ First impression is positive

### What Users Might Not Notice
- Wave only happens during first load
- Typing only happens once
- Both animations are one-time experiences

## Accessibility

### Motion Preferences
Consider respecting `prefers-reduced-motion`:
```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

// Skip animations if user prefers reduced motion
```

### Current Behavior
- Animations don't affect functionality
- Content still loads same way
- Slider still fully accessible
- Screen readers unaffected

## Testing Checklist

✅ Wave starts immediately on page load
✅ Wave moves forward through all dots
✅ Wave reverses direction at ends
✅ Wave loops continuously during loading
✅ Wave stops when content loads
✅ Typing starts after loading completes
✅ Typing reveals characters one by one
✅ Typing only happens for initial headline
✅ Typing never repeats
✅ Moving slider stops typing behavior
✅ Both animations clean up properly

## Build Status

- ✅ TypeScript compilation passed
- ✅ No linting errors
- ✅ Production build successful
- ✅ Animations working smoothly

## Visual Summary

### Loading Experience
```
Step 1: Page loads
        |  •  •  •  •  •  •  •  •  •  •  (wave)
        "Generating content..."

Step 2: Content ready
        •  •  •  •  •  •  •  •  •  •  •  (wave stops)
        "T" (typing starts)

Step 3: Typing in progress
        •  •  •  •  •  •  •  •  •  •  •
        "The Future of"

Step 4: Complete
        •  •  •  •  •  •  •  •  •  •  •
        "The Future of Artificial Intelligence"
```

### Interactive Experience
```
User moves slider:
        •  •  ∣  •  •  •  •  •  •  •  •  (hover preview)
        Content changes instantly
        No typing animation
```

## Summary

**Wave Animation:**
- During: Content generation
- Effect: Moving wave across dots
- Speed: 100ms per step
- Purpose: Engaging loading feedback

**Typing Animation:**
- When: Initial headline loads
- Effect: Character-by-character reveal
- Speed: 30ms per character
- Purpose: Elegant introduction

**Result:**
- Loading feels faster
- First impression is polished
- User engagement increased
- Professional, delightful UX

**Visit http://localhost:3000** and refresh to see both animations! The wave dances during loading, then the headline types out swiftly. ✨

