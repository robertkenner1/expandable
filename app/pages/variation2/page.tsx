'use client';

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function Variation2() {
  const [topic, setTopic] = useState('');
  const [sliderValue, setSliderValue] = useState([0]);
  const [currentContent, setCurrentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGeneratingLevel, setIsGeneratingLevel] = useState(false);

  const generateHeadline = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setHasGenerated(false);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic.trim(), level: 0 }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate headline');
      }

      const data = await response.json();
      setCurrentContent(data.content);
      setSliderValue([0]);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating headline:', error);
      alert('Failed to generate headline. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateLevel = async (level: number) => {
    if (!topic.trim()) return;

    setIsGeneratingLevel(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic.trim(), level }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setCurrentContent(data.content);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGeneratingLevel(false);
    }
  };

  useEffect(() => {
    if (hasGenerated && sliderValue[0] !== 0) {
      generateLevel(sliderValue[0]);
    }
  }, [sliderValue[0]]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Article Expander - Variation 2
              </h1>
              <p className="text-sm text-muted-foreground">
                On-demand loading (generates content as you move the slider)
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
                        generateHeadline();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={generateHeadline}
                  disabled={isLoading || !topic.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Headline...
                    </>
                  ) : (
                    'Generate Headline'
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
                      {isGeneratingLevel && (
                        <span className="ml-2 text-muted-foreground">
                          (Loading...)
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        setHasGenerated(false);
                        setCurrentContent('');
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
                      disabled={isGeneratingLevel}
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
                    {isGeneratingLevel ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {currentContent}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-center pt-4">
              <Button
                variant="link"
                onClick={() => (window.location.href = '/pages/variation1')}
              >
                ← Try Variation 1 (Pre-loaded)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

