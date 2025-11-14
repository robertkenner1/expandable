'use client';

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

const TOPICS = [
  'The history of artificial intelligence',
  'How quantum computers work',
  'The future of renewable energy',
  'The science behind climate change',
  'The evolution of the internet',
  'The impact of social media on society',
  'The development of electric vehicles',
  'The exploration of Mars',
  'The rise of cryptocurrency',
  'The future of work and automation',
  'The discovery of DNA',
  'The history of space exploration',
  'The development of vaccines',
  'The invention of the printing press',
  'The industrial revolution',
];

interface ArticleLevel {
  level: number;
  content: string;
}

export default function Home() {
  const [sliderValue, setSliderValue] = useState([0]);
  const [articleLevels, setArticleLevels] = useState<ArticleLevel[]>([]);
  const [currentContent, setCurrentContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [topic, setTopic] = useState('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [typedContent, setTypedContent] = useState('');

  // Generate random topic on mount
  useEffect(() => {
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    setTopic(randomTopic);
  }, []);

  // Initial generation when topic is set (always pre-loaded)
  useEffect(() => {
    if (topic) {
      generateFullArticle();
    }
  }, [topic]);

  // Delay showing content until slider animation completes
  useEffect(() => {
    if (!isLoading) {
      // Wait for slider animation to complete:
      // - Pulse completion: up to 400ms
      // - Collapsed phase: 50ms
      // - Expanding phase: 600ms
      // Total: ~1100ms
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 1100);
      
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading]);

  const generateFullArticle = async () => {
    setIsLoading(true);
    setIsFirstLoad(true); // Reset for new content
    try {
      const response = await fetch('/api/generate-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) throw new Error('Failed to generate article');

      const data = await response.json();
      setArticleLevels(data.levels);
      setCurrentContent(data.levels[0].content);
      setSliderValue([0]);
    } catch (error) {
      console.error('Error generating article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update content when slider moves
  useEffect(() => {
    if (articleLevels.length > 0) {
      const level = articleLevels.find((l) => l.level === sliderValue[0]);
      if (level) {
        setCurrentContent(level.content);
        // Reset typing animation when moving away from level 0
        if (sliderValue[0] !== 0) {
          setIsFirstLoad(false);
        }
      }
    }
  }, [sliderValue[0], articleLevels]);

  // Typing animation for initial headline
  useEffect(() => {
    if (!isFirstLoad || sliderValue[0] !== 0 || !currentContent || !showContent) {
      setTypedContent(currentContent);
      return;
    }

    // Reset typed content
    setTypedContent('');
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < currentContent.length) {
        setTypedContent(currentContent.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsFirstLoad(false); // Only animate once
      }
    }, 30); // 30ms per character for swift typing

    return () => clearInterval(typingInterval);
  }, [currentContent, isFirstLoad, sliderValue, showContent]);

  // Calculate font size: 4rem at level 0, 1rem at level 9
  const fontSize = 4 - ((sliderValue[0] / 9) * 3);
  
  // Calculate line height: tighter for larger text, more relaxed for smaller
  // At 4rem: 1.2, at 1rem: 1.6
  const lineHeight = 1.2 + ((sliderValue[0] / 9) * 0.4);

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-12 pb-12 px-12">
        {/* Slider above content */}
        <div className="mb-12">
          <Slider
            value={sliderValue}
            onValueChange={setSliderValue}
            min={0}
            max={9}
            step={1}
            disabled={isLoading}
          />
        </div>

        {/* Main content area - only text */}
        {showContent && (
          <div
            className="text-foreground transition-all duration-300"
            style={{ fontSize: `${fontSize}rem`, lineHeight: lineHeight }}
          >
            {(isFirstLoad && sliderValue[0] === 0 ? typedContent : currentContent)
              .split('\n')
              .map((paragraph, index) => (
                paragraph.trim() ? (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ) : null
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
