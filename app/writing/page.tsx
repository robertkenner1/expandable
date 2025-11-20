'use client';

import { useState, useEffect } from 'react';
import { TriangleSlider } from '@/components/ui/triangle-slider';

// Each paragraph has 5 versions: 0 (simplest) to 4 (most complex)
const paragraphVersions = [
  // Paragraph 1: About attention as currency
  [
    "Attention is currency now. We chase it but lose ourselves.", // Level 0 - simplest
    "Attention has become currency in our digital age. The more we chase it, the more exhausted we become.", // Level 1
    "We live in an age where attention has become currency, traded and bartered across platforms designed to extract every possible second from our conscious awareness. Yet the more we chase it, the more elusive it becomes—slipping through our fingers like sand, leaving us exhausted and somehow emptier than before.", // Level 2 - default
    "We live in an age where attention has become currency, systematically traded and bartered across carefully engineered platforms designed to extract every possible second from our conscious awareness. Yet paradoxically, the more desperately we chase it, the more elusive it becomes—slipping through our fingers like sand at the beach, leaving us not just exhausted but somehow emptier, more disconnected than before we began.", // Level 3
    "We live in an unprecedented age where human attention has been commodified into currency, systematically traded and bartered across carefully engineered digital platforms specifically designed to extract every possible second, every fleeting moment from our conscious awareness. Yet paradoxically, the more desperately and relentlessly we chase after it, attempting to capture and hold what feels increasingly scarce, the more frustratingly elusive it becomes—slipping through our fingers like fine sand at the beach, leaving us not just physically exhausted and mentally depleted, but somehow emptier, more fundamentally disconnected from ourselves and others than we were before we even began this futile pursuit." // Level 4 - most complex
  ],
  // Paragraph 2: About depth of attention
  [
    "Real attention is about depth, not speed.", // Level 0
    "Real attention isn't measured in clicks or seconds. It's about depth—the difference between skimming and truly understanding.", // Level 1
    "Real attention, the kind that matters, isn't measured in seconds or clicks. It's measured in depth. It's the difference between skimming a surface and diving beneath it. Between reading words and understanding meaning. Between looking at something and truly seeing it.", // Level 2 - default
    "Real attention, the kind that actually matters and creates lasting impact, isn't measured in seconds or clicks or any quantifiable metric. It's measured in depth, in the quality of engagement. It's the fundamental difference between skimming a surface and diving deep beneath it. Between reading words on a page and understanding their deeper meaning. Between looking at something with your eyes and truly seeing it with your mind and heart.", // Level 3
    "Real attention, the kind that actually matters and creates lasting impact in our lives and understanding, isn't measured in seconds or clicks or any easily quantifiable metric that our digital systems prefer. It's measured in depth, in the profound quality of our engagement with ideas and experiences. It's the fundamental difference between merely skimming along a surface, collecting data points, and diving deep beneath it to explore what lies below. Between mechanically reading words on a page and genuinely understanding their deeper meaning and implications. Between casually looking at something with your eyes, processing its visual properties, and truly seeing it with your full mind and open heart, allowing it to change you." // Level 4
  ],
  // Paragraph 3: The paradox
  [
    "More information, less understanding.", // Level 0
    "We've never had more information available, yet we're starved for real understanding. We consume constantly but digest nothing meaningful.", // Level 1
    "The paradox is that we've never had more information available to us, yet we've rarely been more starved for understanding. We consume endlessly but digest nothing. We scroll through a thousand fragments, each demanding our attention, but offer none of them the focus they need to become something more than noise.", // Level 2 - default
    "The paradox of our current moment is that we've never had more information instantly available to us at our fingertips, yet we've rarely been more genuinely starved for real understanding and wisdom. We consume endlessly, voraciously scrolling and clicking, but digest absolutely nothing of substance. We scroll through a thousand fragmented pieces of content, each desperately demanding our attention, but we offer none of them the sustained focus and consideration they would need to become something more meaningful than just background noise.", // Level 3
    "The profound paradox of our current cultural and technological moment is that we've never in human history had more information instantly available to us at our fingertips, accessible with the slightest touch or voice command, yet simultaneously we've rarely been more genuinely starved for real understanding, meaningful insight, and hard-won wisdom. We consume endlessly and voraciously, constantly scrolling and clicking through infinite feeds, but we digest absolutely nothing of real substance or lasting value. We scroll mechanically through a thousand fragmented pieces of decontextualized content, each one desperately demanding our scattered attention with notifications and alerts, but we offer none of them the sustained focus, careful consideration, and deep engagement they would actually need to transform from mere data points into something more meaningful than just disposable background noise in our overcrowded mental landscape." // Level 4
  ],
  // Paragraph 4: Different relationship
  [
    "We need a new relationship with attention.", // Level 0
    "Perhaps we need a different relationship with attention—not as a resource to optimize, but as a practice to cultivate through dedication.", // Level 1
    "Perhaps what we need isn't better tools for managing our attention, but a different relationship with it entirely. Not attention as a resource to be optimized, but as a practice to be cultivated. Not something to be divided and distributed, but something to be given fully, completely, if only for a moment.", // Level 2 - default
    "Perhaps what we truly need isn't just better tools and techniques for managing our attention more efficiently, but a fundamentally different relationship with it entirely. Not treating attention as a finite resource to be optimized and allocated like a budget, but as a sacred practice to be cultivated with care and intention. Not something to be divided and distributed across competing demands, but something to be given fully, completely, wholeheartedly, even if only for a single precious moment.", // Level 3
    "Perhaps what we truly need at this critical juncture isn't just better tools and techniques for managing our attention more efficiently and productively, but a fundamentally different and more humane relationship with it entirely, a reimagining of what attention means and how it functions in our lives. Not treating attention as merely a finite resource to be optimized, scheduled, and allocated like items in a budget or time blocks in a calendar, but as a sacred practice to be cultivated with patience, care, and mindful intention over time. Not something to be anxiously divided, split, and distributed across dozens of competing demands and obligations, but something to be given fully, completely, wholeheartedly and without reservation, even if only for a single precious moment of genuine connection and presence." // Level 4
  ],
  // Paragraph 5: Conclusion
  [
    "What we pay attention to shapes who we become.", // Level 0
    "What we pay attention to defines not just what we know, but who we become. Our attention shapes our thoughts and actions.", // Level 1
    "Because in the end, what we pay attention to defines not just what we know, but who we become. Our attention shapes our thoughts, our thoughts shape our actions, and our actions shape our lives. The question isn't whether we can afford to pay attention—it's whether we can afford not to.", // Level 2 - default
    "Because in the end, what we choose to pay attention to defines not just what we happen to know, but fundamentally who we become as people. Our attention shapes and molds our thoughts, our thoughts in turn shape our actions and behaviors, and our actions ultimately shape the entire trajectory of our lives. The real question isn't whether we can afford to pay attention in a world of infinite distractions—it's whether we can afford not to.", // Level 3
    "Because in the end, when all is said and done, what we deliberately choose to pay attention to, what we allow into our consciousness and grant the privilege of our focus, defines not just what facts and information we happen to know at any given moment, but fundamentally who we become as human beings, what kind of people we develop into over time. Our attention shapes and molds our thoughts and internal narratives, our thoughts in turn shape our actions and observable behaviors, and our actions ultimately and inexorably shape the entire trajectory and quality of our lives, rippling outward to affect everyone around us. The real question we must grapple with isn't whether we can afford to pay sustained, meaningful attention in a world of infinite distractions and competing demands—it's whether we can possibly afford not to, whether we can survive as thinking, feeling beings without it." // Level 4
  ]
];

export default function Writing() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize all paragraphs at level 2 (default state - 3rd dot)
  const [sliderValues, setSliderValues] = useState<Record<number, number[]>>(
    paragraphVersions.reduce((acc, _, idx) => ({ ...acc, [idx]: [2] }), {})
  );

  // Simulate loading - wait for content to be ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 second loading time
    
    return () => clearTimeout(timer);
  }, []);

  const handleSliderChange = (pIndex: number, value: number[]) => {
    setSliderValues(prev => ({ ...prev, [pIndex]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative" style={{ width: '20px', height: '20px' }}>
          <div
            className="absolute top-1/2 left-1/2 bg-black"
            style={{
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'pulse 0.8s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center pt-20">
      <div className="max-w-3xl mx-auto px-8">
        <article className="text-foreground" style={{ fontSize: '1.3rem', lineHeight: 1.6 }}>
          {paragraphVersions.map((versions, pIndex) => {
            const currentLevel = sliderValues[pIndex]?.[0] ?? 2;
            const currentText = versions[currentLevel];
            
            return (
              <div key={pIndex} className="relative group mb-4 flex gap-3">
                {/* Triangle slider to the left of paragraph */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto flex items-end" style={{ height: '1.3rem', transform: 'translateY(3px)' }}>
                  <TriangleSlider
                    value={sliderValues[pIndex]}
                    onValueChange={(value) => handleSliderChange(pIndex, value)}
                    min={0}
                    max={4}
                    width={24}
                    height={16}
                  />
                </div>
                
                <p className="flex-1">{currentText}</p>
              </div>
            );
          })}
        </article>
      </div>
    </div>
  );
}

