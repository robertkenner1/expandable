"use client"

import * as React from "react"

interface TriangleSliderProps {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  width?: number
  height?: number
}

export function TriangleSlider({
  value = [0],
  onValueChange,
  min = 0,
  max = 4,
  width = 100,
  height = 16,
}: TriangleSliderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const currentValue = Array.isArray(value) ? value[0] : min
  const fillPercentage = ((currentValue - min) / (max - min)) * 100

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
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, x / rect.width))
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

  // Right triangle: 90° angle at bottom-left, horizontal bottom, diagonal top
  const trianglePath = `M 0 ${height} L ${width} 0 L ${width} ${height} Z`
  
  // Filled triangle - clips to the percentage from left to right
  const fillWidth = (fillPercentage / 100) * width
  const topEdge = height - (fillPercentage / 100) * height
  const fillPath = `M 0 ${height} L ${fillWidth} ${topEdge} L ${fillWidth} ${height} Z`

  return (
    <div 
      ref={containerRef}
      style={{ borderRadius: '2px', overflow: 'hidden', cursor: 'pointer' }}
      onMouseDown={handleMouseDown}
    >
      <svg
        width={width}
        height={height}
        style={{ display: 'block' }}
      >
        {/* Background triangle - slightly darker than background */}
        <path
          d={trianglePath}
          fill="#F5EFE9"
          stroke="none"
        />
        
        {/* Filled triangle - black fill up to current value */}
        <path
          d={fillPath}
          fill="#000000"
          stroke="none"
        />
      </svg>
    </div>
  )
}

