'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Loader2 } from 'lucide-react';

interface ArticleLevel {
  level: number;
  content: string;
}

export default function Variation1() {
  const [topic, setTopic] = useState('');
  const [sliderValue, setSliderValue] = useState([0]);
  const [articleLevels, setArticleLevels] = useState<ArticleLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateFullArticle = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setHasGenerated(false);

    try {
      const response = await fetch('/api/generate-full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate article');
      }

      const data = await response.json();
      setArticleLevels(data.levels);
      setSliderValue([0]);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating article:', error);
      alert('Failed to generate article. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentContent = articleLevels.find(
    (level) => level.level === sliderValue[0]
  )?.content || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Article Expander - Variation 1
              </h1>
              <p className="text-sm text-muted-foreground">
                Pre-loaded expansion (all levels generated at once)
              </p>
            </div>

            {/* Topic Input */}
            {!hasGenerated && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">
                    Enter a topic for your article:
                  </Label>
                  <Input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The history of artificial intelligence"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) {
                        generateFullArticle();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={generateFullArticle}
                  disabled={isLoading || !topic.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Article...
                    </>
                  ) : (
                    'Generate Article'
                  )}
                </Button>
              </div>
            )}

            {/* Article Display */}
            {hasGenerated && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      Expansion Level: {sliderValue[0]} / 10
                    </div>
                    <Button
                      onClick={() => {
                        setHasGenerated(false);
                        setArticleLevels([]);
                        setSliderValue([0]);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      New Topic
                    </Button>
                  </div>

                  {/* Slider */}
                  <div className="py-4">
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      min={0}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Headline</span>
                      <span>Full Article</span>
                    </div>
                  </div>
                </div>

                {/* Content Display */}
                <Card className="bg-muted/50">
                  <CardContent className="p-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {currentContent}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-center pt-4">
              <Button
                variant="link"
                onClick={() => (window.location.href = '/pages/variation2')}
              >
                Try Variation 2 (On-Demand Loading) →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

