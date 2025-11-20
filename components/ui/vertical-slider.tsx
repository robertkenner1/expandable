"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface VerticalSliderProps {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

function VerticalSlider({
  className,
  value,
  min = 0,
  max = 4,
  disabled,
  onValueChange,
  ...props
}: VerticalSliderProps) {
  const [hoveredMarker, setHoveredMarker] = React.useState<number | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const currentValue = Array.isArray(value) ? value[0] : min
  
  // Generate markers (5 markers for 0-4, evenly spaced vertically)
  const markerCount = max - min + 1
  const height = 80 // Total height in pixels

  // Custom drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
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
    const y = e.clientY - rect.top
    const percent = Math.max(0, Math.min(1, y / rect.height))
    const newValue = Math.round(percent * (max - min) + min)
    
    if (onValueChange) {
      onValueChange([newValue])
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
    const percentage = ((markerValue - min) / (max - min)) * 100
    
    // Vertical position (top to bottom)
    const y = (percentage / 100) * height
    
    const isActive = currentValue === markerValue
    const isHovered = hoveredMarker === markerValue
    
    // Determine width for vertical orientation
    let width = '2px'
    let borderRadius = '50%'
    
    if (isActive) {
      width = '10px'
      borderRadius = '0'
    } else if (isHovered) {
      width = '5px'
      borderRadius = '0'
    }
    
    return {
      y,
      width,
      borderRadius,
      markerValue,
    }
  })

  return (
    <div 
      ref={containerRef}
      className={cn("relative", className)}
      style={{ 
        width: '20px', 
        height: `${height}px`,
        cursor: 'pointer'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Dots container */}
      <div className="absolute inset-0 flex flex-col items-center">
        {dots.map((dot, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${dot.y}px`,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.2s ease-out',
            }}
            onMouseEnter={() => setHoveredMarker(dot.markerValue)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            <div
              className="bg-black"
              style={{
                width: dot.width,
                height: '2px',
                borderRadius: dot.borderRadius,
                transition: 'all 0.2s ease-out',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export { VerticalSlider }


