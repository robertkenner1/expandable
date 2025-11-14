"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  disabled,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const [mounted, setMounted] = React.useState(false)
  const [hoveredMarker, setHoveredMarker] = React.useState<number | null>(null)
  const [animationPhase, setAnimationPhase] = React.useState<'loading' | 'collapsed' | 'expanding' | 'interactive'>('loading')
  const [breathProgress, setBreathProgress] = React.useState(0)
  const [expandProgress, setExpandProgress] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  // Ensure consistent initial render between server and client
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  // Calculate current position as percentage for the circle indicator
  const currentValue = Array.isArray(value) ? value[0] : min
  const percentage = ((currentValue - min) / (max - min)) * 100

  // Generate markers (10 markers for 0-9, evenly spaced)
  const markerCount = max - min + 1
  const stackSpacing = 4 // 4px spacing between dots when expanded (vertical)

  // Main animation controller
  React.useEffect(() => {
    let animationFrameId: number | null = null
    
    if (disabled) {
      // LOADING PHASE: Pulsing opacity animation
      setAnimationPhase('loading')
      
      const cycleDuration = 800 // Faster pulse
      const startTime = Date.now()

      const animate = () => {
        const elapsed = (Date.now() - startTime) % cycleDuration
        const progress = elapsed / cycleDuration
        
        // Smooth pulse between 0.3 and 1 (so dot is always visible)
        const pulse = Math.sin(progress * Math.PI * 2) * 0.35 + 0.65
        
        setBreathProgress(pulse)
        
        animationFrameId = requestAnimationFrame(animate)
      }

      animate() // Start immediately
      
      return () => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId)
        }
      }
    } else if (animationPhase === 'loading') {
      // Loading just finished - wait for pulse animation to complete at scale 1.0
      const expandToSlider = () => {
        const duration = 600
        const startTime = Date.now()

        const animate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          
          // Ease in-out
          const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2
          
          setExpandProgress(eased)

          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            setExpandProgress(1)
            setAnimationPhase('interactive')
          }
        }

        animate()
      }

      // Calculate time to wait until pulse completes at scale 1.0
      const cycleDuration = 800
      const currentProgress = breathProgress
      
      // breathProgress oscillates 0.3-1.0 (we changed it earlier)
      // We want to wait until the next time it reaches 0.65 (baseline) or completes cycle
      // For simplicity, wait for next cycle completion (0-400ms depending on current position)
      const waitTime = cycleDuration - (Date.now() % cycleDuration)
      
      setTimeout(() => {
        setBreathProgress(0.65) // Set to baseline
        setAnimationPhase('collapsed')
        setTimeout(() => {
          setAnimationPhase('expanding')
          expandToSlider()
        }, 50)
      }, Math.min(waitTime, 400)) // Wait max 400ms to complete current cycle
    }
  }, [disabled, animationPhase, breathProgress])

  // Custom drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (animationPhase !== 'interactive') return
    setIsDragging(true)
    updateValueFromMouse(e)
  }

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return
    updateValueFromMouse(e as any)
  }, [isDragging])

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  const updateValueFromMouse = (e: MouseEvent | React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, x / rect.width))
    const newValue = Math.round(percent * (max - min) + min)
    
    if (props.onValueChange) {
      props.onValueChange([newValue])
    }
  }

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Calculate dot positions
  const dots = Array.from({ length: markerCount }, (_, i) => {
    const markerValue = min + i
    const linearPercentage = ((markerValue - min) / (max - min)) * 100
    
    // Final position (horizontal slider)
    const finalX = (linearPercentage / 100) * 170 - 85
    const finalY = 0
    
    // Starting position (all overlapping at first dot position)
    const startX = -85
    const startY = 0
    
    // Calculate position based on animation phase
    let x, y, opacity
    
    if (animationPhase === 'loading') {
      // Only show the first dot pulsing during loading
      x = startX
      y = startY
      opacity = i === 0 ? breathProgress : 0 // Only first dot pulses, others hidden
    } else if (animationPhase === 'collapsed') {
      // All dots appear at the same position
      x = startX
      y = startY
      opacity = 1
    } else if (animationPhase === 'expanding') {
      // Expand from start to final with stagger
      const dotDelay = i / markerCount * 0.3 // Stagger across first 30% of animation
      const dotProgress = Math.max(0, Math.min(1, (expandProgress - dotDelay) / (1 - dotDelay)))
      
      x = startX + (finalX - startX) * dotProgress
      y = startY
      opacity = 1
    } else {
      // Interactive phase
      x = finalX
      y = finalY
      opacity = 1
    }
    
    const isActive = currentValue === markerValue
    const isHovered = hoveredMarker === markerValue
    
    // Determine height
    let height = '2px'
    let borderRadius = '50%'
    
    if (animationPhase === 'interactive') {
      if (isActive) {
        height = '10px'
        borderRadius = '0'
      } else if (isHovered) {
        height = '5px'
        borderRadius = '0'
      }
    }
    
    return {
      x,
      y,
      opacity,
      height,
      borderRadius,
      markerValue,
    }
  })

  // Show simple loading state during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div 
        className="relative"
        style={{ 
          width: '170px', 
          height: '20px',
        }}
      />
    )
  }

  // Container height is consistent now
  const containerHeight = '20px'

  return (
    <div 
      ref={containerRef}
      className="relative"
      style={{ 
        width: '170px', 
        height: containerHeight,
        cursor: animationPhase === 'interactive' ? 'pointer' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Dots container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {dots.map((dot, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              transform: `translate(${dot.x}px, ${dot.y}px)`,
              opacity: animationPhase === 'loading' && i === 0 ? 1 : dot.opacity, // Let CSS animation handle loading dot opacity
              transition: animationPhase === 'interactive' ? 'all 0.2s ease-out' : 'none',
            }}
            onMouseEnter={() => animationPhase === 'interactive' && setHoveredMarker(dot.markerValue)}
            onMouseLeave={() => animationPhase === 'interactive' && setHoveredMarker(null)}
          >
            <div
              className="bg-black"
              style={{
                width: '2px',
                height: dot.height,
                borderRadius: dot.borderRadius,
                transform: animationPhase === 'loading' && i === 0 ? undefined : 'translate(-50%, -50%)',
                transition: 'all 0.2s ease-out',
                animation: animationPhase === 'loading' && i === 0 ? 'pulse 0.8s ease-in-out infinite' : 'none',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export { Slider }
