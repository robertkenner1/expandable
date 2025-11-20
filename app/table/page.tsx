"use client"

import { useState, useEffect, useCallback } from "react"
import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles, Check, ArrowLeft, ListTodo, Settings2, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"
import ExperimentNav from "@/components/ExperimentNav"

type University = {
  id: string
  name: string
  pros: string
  cons: string
  scores: Record<string, number>
  facts?: Record<string, Array<{ text: string; sentiment: 'positive' | 'negative' | 'neutral' }>>
  rank?: number
  summary?: string
  rankScore?: number
  score?: number
}

type Column = {
  id: string
  name: string
  weight: number
  aiGenerated: boolean
  description?: string
  category: 'content' | 'model' | 'status' | 'topic'
}

type TableState = 'initial' | 'analyzing' | 'scoring' | 'ready_for_recommendation' | 'recommended'
type TablePhase = 'building' | 'ready' | 'complete'

const initialColumns: Column[] = [
  { id: "name", name: "School", weight: 1, aiGenerated: false, category: 'content' },
  { id: "pros", name: "Pros", weight: 1, aiGenerated: false, category: 'content' },
  { id: "cons", name: "Cons", weight: 1, aiGenerated: false, category: 'content' },
  { 
    id: "col_cost", 
    name: "Cost", 
    weight: 0.8, 
    aiGenerated: true,
    description: "Overall affordability including tuition, fees, and living expenses",
    category: 'model'
  },
  { 
    id: "col_program", 
    name: "Program", 
    weight: 0.9, 
    aiGenerated: true,
    description: "Quality and reputation of the CS program",
    category: 'model'
  },
  { 
    id: "col_location", 
    name: "Location", 
    weight: 0.6, 
    aiGenerated: true,
    description: "Climate, proximity to family, and overall desirability of location",
    category: 'model'
  },
  { 
    id: "col_culture", 
    name: "Culture", 
    weight: 0.7, 
    aiGenerated: true,
    description: "How well the university's culture and intensity match your preferences",
    category: 'model'
  }
]

const initialUniversities: University[] = [
  {
    id: "1",
    name: "Stanford",
    pros: "Dream school. World-class CS program. Perfect California weather. Very collaborative environment.",
    cons: "Really far from home. Expensive Bay Area cost of living on top of tuition.",
    scores: {
      "col_cost": 3,
      "col_program": 10,
      "col_location": 9,
      "col_culture": 9
    }
  },
  {
    id: "2",
    name: "MIT",
    pros: "Best engineering reputation globally. Close to family. Amazing peer network and career outcomes.",
    cons: "Weather is brutal. Intense academic pressure and competitive culture.",
    scores: {
      "col_cost": 3,
      "col_program": 10,
      "col_location": 5,
      "col_culture": 7
    }
  },
  {
    id: "3",
    name: "UC Berkeley",
    pros: "More affordable than privates. Love the Bay Area vibe and weather. Great tech scene access.",
    cons: "Concerned about large class sizes. Very competitive student culture.",
    scores: {
      "col_cost": 6,
      "col_program": 9,
      "col_location": 9,
      "col_culture": 6
    }
  },
  {
    id: "4",
    name: "Carnegie Mellon",
    pros: "CS program is legendary. Best robotics and AI labs. Worth it for career outcomes.",
    cons: "Most expensive option. Pittsburgh isn't ideal. Everyone says it's really intense.",
    scores: {
      "col_cost": 3,
      "col_program": 10,
      "col_location": 4,
      "col_culture": 6
    }
  },
  {
    id: "5",
    name: "Georgia Tech",
    pros: "Best value for money. Parents would save a lot. Atlanta is growing for tech. Great recruiting outcomes.",
    cons: "Less prestigious name. Not sure if it's worth the ranking difference.",
    scores: {
      "col_cost": 8,
      "col_program": 8,
      "col_location": 7,
      "col_culture": 8
    }
  },
  {
    id: "6",
    name: "Cornell",
    pros: "Ivy League prestige. Strong engineering school. Beautiful campus. Good balance of academics and social life.",
    cons: "Isolated location. Very cold winters. Large student body means less individual attention.",
    scores: {
      "col_cost": 4,
      "col_program": 9,
      "col_location": 5,
      "col_culture": 7
    }
  },
  {
    id: "7",
    name: "UT Austin",
    pros: "Excellent CS program. Affordable tuition. Amazing city for young people. Great weather year-round.",
    cons: "Huge school - might get lost. Far from family. Very competitive to get into top CS classes.",
    scores: {
      "col_cost": 7,
      "col_program": 8,
      "col_location": 8,
      "col_culture": 8
    }
  }
]

const initialRecommendation = "Based on your criteria, I recommend Stanford. While it's the most expensive option (3/10 on cost), it excels in the areas you've weighted most heavily: it has an outstanding CS program (9/10), exceptional weather and location (9/10), and a strong culture fit (8/10). The combination of academic excellence, ideal climate, and balanced campus culture makes it the best overall choice despite the higher cost. Your total weighted score of 7.6 reflects this strong alignment with your priorities."

const unstructuredNotes = `Stanford - dream school, world-class CS program, perfect California weather, very collaborative environment. But really far from home and expensive Bay Area cost of living on top of tuition.

MIT - best engineering reputation globally, close to family, amazing peer network and career outcomes. Weather is brutal though and intense academic pressure, competitive culture.

UC Berkeley - more affordable than privates, love the Bay Area vibe and weather, great tech scene access. Concerned about large class sizes and very competitive student culture.`

export default function UniversityTable() {
  const [viewMode, setViewMode] = useState<'notes' | 'table'>('table')
  const [selectedText, setSelectedText] = useState('')
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [universities, setUniversities] = useState<University[]>(initialUniversities)
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [visibleColumnCount, setVisibleColumnCount] = useState(3) // Start with first 3 columns (School, Pros, Cons)
  const [visibleRowCount, setVisibleRowCount] = useState(3) // Start with 3 rows
  const [tableState, setTableState] = useState<TableState>('scoring')
  const [tablePhase, setTablePhase] = useState<TablePhase>('building')
  const [recommendation, setRecommendation] = useState<string>("")
  const [columnPriorities, setColumnPriorities] = useState<Record<string, 'low' | 'medium' | 'high'>>({}) // Track priority for each column
  const [modelSummary, setModelSummary] = useState<string>("")
  const [cardTitle, setCardTitle] = useState<string>("Choosing a University")
  const [isLoadingColumn, setIsLoadingColumn] = useState(false)
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false)
  const [manualUniversityName, setManualUniversityName] = useState("")
  const [isLoadingManualUniversity, setIsLoadingManualUniversity] = useState(false)
  const [isHoveringTable, setIsHoveringTable] = useState(false)
  const [isCleanedUp, setIsCleanedUp] = useState(false)
  const [cleanupPhase, setCleanupPhase] = useState<'idle' | 'reading' | 'analyzing' | 'creating' | 'migrating' | 'collapsing' | 'complete'>('idle')
  const [streamingTopics, setStreamingTopics] = useState<any[]>([])
  const [streamingFacts, setStreamingFacts] = useState<Record<string, any>>({})
  const [streamingText, setStreamingText] = useState<Record<string, Record<string, string>>>({}) // uniId -> topicId -> partial text
  const [isPreloading, setIsPreloading] = useState(true)
  const [preloadedData, setPreloadedData] = useState<{
    topics: any[]
    sortedTopics: any[]
    normalizedData: any[]
    recommendation?: string
    title?: string
    summary?: Record<string, string>
  } | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [isPrioritized, setIsPrioritized] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isHoveringTableMenu, setIsHoveringTableMenu] = useState(false)
  const [isHoveringRowMenu, setIsHoveringRowMenu] = useState(false)
  const [isHoveringColumnMenu, setIsHoveringColumnMenu] = useState(false)
  
  // Drag and drop state
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null)
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null)
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null)
  
  // Close export menu when clicking outside
  useEffect(() => {
    if (showExportMenu) {
      const handleClickOutside = () => setShowExportMenu(false)
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showExportMenu])
  
  // Preload cleanup and summary on mount
  useEffect(() => {
    const preloadData = async () => {
      try {
        const visibleUnis = universities.slice(0, visibleRowCount)
        
        // Preload cleanup
        const cleanupResponse = await fetch('/api/clean-up-table', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            universities: visibleUnis.map(u => ({
              id: u.id,
              name: u.name,
              pros: u.pros,
              cons: u.cons
            }))
          })
        })
        
        if (!cleanupResponse.ok || !cleanupResponse.body) {
          throw new Error('Failed to preload cleanup')
        }
        
        // Read the full stream
        const reader = cleanupResponse.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
        }
        
        const cleanupResult = JSON.parse(buffer)
        
        // Preload summary
        const summaryResponse = await fetch('/api/generate-model-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            universities: cleanupResult.normalizedData.map((u: any) => ({
              name: u.name,
              pros: visibleUnis.find(uni => uni.id === u.id)?.pros || '',
              cons: visibleUnis.find(uni => uni.id === u.id)?.cons || '',
              scores: {},
              totalScore: null
            })),
            columns: cleanupResult.topics.map((t: any) => ({
              id: t.id,
              name: t.name
            }))
          })
        })
        
        let summaryResult: { recommendation?: string; title?: string; summary?: Record<string, string> } = {}
        if (summaryResponse.ok) {
          summaryResult = await summaryResponse.json()
        } else {
          console.error('Summary API failed with status:', summaryResponse.status)
          const errorText = await summaryResponse.text()
          console.error('Summary API error:', errorText)
        }
        
        // Sort topics by priority: high -> medium -> low
        const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 }
        const sortedTopics = [...cleanupResult.topics].sort((a: any, b: any) => {
          const priorityA = priorityOrder[a.priority as 'high' | 'medium' | 'low'] ?? 1
          const priorityB = priorityOrder[b.priority as 'high' | 'medium' | 'low'] ?? 1
          return priorityA - priorityB
        })
        
        setPreloadedData({
          topics: cleanupResult.topics,
          sortedTopics: sortedTopics,
          normalizedData: cleanupResult.normalizedData,
          recommendation: summaryResult.recommendation,
          title: summaryResult.title,
          summary: summaryResult.summary
        })
        
        setIsPreloading(false)
      } catch (error) {
        console.error('Preload error:', error)
        setIsPreloading(false)
      }
    }
    
    preloadData()
  }, []) // Only run once on mount
  
  // Determine if AI has enough data for a recommendation
  const aiGeneratedColumnCount = columns.filter(c => c.aiGenerated).length
  const hasEnoughData = aiGeneratedColumnCount >= 4 && visibleRowCount >= 3
  
  // Update phase when we have enough data
  React.useEffect(() => {
    if (hasEnoughData && tablePhase === 'building') {
      setTablePhase('ready')
    }
  }, [hasEnoughData, tablePhase])
  
  // Get visible columns and rows
  const visibleColumns = columns.slice(0, visibleColumnCount)
  const visibleUniversities = universities.slice(0, visibleRowCount)
  const hasMoreColumns = visibleColumnCount < columns.length
  const hasMoreRows = visibleRowCount < universities.length
  
  // Get next 4 universities to show as tags
  const upcomingUniversities = universities.slice(visibleRowCount, visibleRowCount + 4)

  // Calculate total weighted score for each university
  const calculateTotalScore = (university: University, columnsToUse?: Column[]) => {
    const scoreColumns = (columnsToUse || columns).filter(col => col.aiGenerated)
    if (scoreColumns.length === 0) return null
    
    const totalWeight = scoreColumns.reduce((sum, col) => sum + col.weight, 0)
    const weightedSum = scoreColumns.reduce((sum, col) => {
      const score = university.scores[col.id] || 0
      return sum + (score * col.weight)
    }, 0)
    
    return totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : null
  }

  // Simplify criterion name to single word
  const simplifyLabel = (name: string) => {
    const nameLower = name.toLowerCase()
    if (nameLower.includes('cost') || nameLower.includes('price') || nameLower.includes('afford')) {
      return 'Cost'
    }
    if (nameLower.includes('program') || nameLower.includes('academic') || nameLower.includes('education')) {
      return 'Program'
    }
    if (nameLower.includes('location') || nameLower.includes('place') || nameLower.includes('geography')) {
      return 'Location'
    }
    if (nameLower.includes('culture') || nameLower.includes('fit') || nameLower.includes('social')) {
      return 'Culture'
    }
    // Default: take first word
    return name.split(' ')[0]
  }

  // Custom tick with label positioning adjustments
  const CustomAngleTick = ({ payload, x, y, textAnchor, ...rest }: any) => {
    const label = payload.value
    let yOffset = 0
    
    // Adjust positioning based on label
    if (label === 'Culture' || label === 'Program') {
      yOffset = 2
    } else if (label === 'Location') {
      yOffset = 3
    }
    
    return (
      <g className="recharts-layer recharts-polar-angle-axis-tick">
        <text
          x={x}
          y={y + yOffset}
          textAnchor={textAnchor}
          fontSize={10}
          fill="hsl(var(--muted-foreground))"
        >
          {label}
        </text>
      </g>
    )
  }

  // AI suggests next column based on existing data
  const handleAddAIColumn = async () => {
    setIsLoadingColumn(true)
    setTableState('analyzing')
    
    try {
      // Call AI API to analyze pros/cons and suggest next column
      const response = await fetch('/api/suggest-column', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universities: universities.map(u => ({
            id: u.id,
            name: u.name,
            pros: u.pros,
            cons: u.cons
          })),
          existingColumns: columns.filter(c => c.aiGenerated).map(c => c.name)
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch column suggestion')
      }
      
      const { column, scores } = await response.json()
      
      // Add new column
      const newColumn: Column = {
        id: `col_${Date.now()}`,
        name: column.name,
        weight: 0.5,
        aiGenerated: true,
        description: column.description,
        category: 'model'
      }
      
      setColumns([...columns, newColumn])
      
      // Update scores for all universities
      setUniversities(universities.map(u => ({
        ...u,
        scores: {
          ...u.scores,
          [newColumn.id]: scores[u.id] || 0
        }
      })))
      
      // Update state
      if (columns.filter(c => c.aiGenerated).length >= 2) {
        setTableState('ready_for_recommendation')
      } else {
        setTableState('scoring')
      }
      
    } catch (error) {
      console.error('Failed to add AI column:', error)
      setTableState('initial')
    } finally {
      setIsLoadingColumn(false)
    }
  }

  // Get AI recommendation
  const handleGetRecommendation = async () => {
    setIsLoadingRecommendation(true)
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universities: universities.map(u => ({
            name: u.name,
            pros: u.pros,
            cons: u.cons,
            scores: u.scores,
            totalScore: calculateTotalScore(u)
          })),
          columns: columns.filter(c => c.aiGenerated)
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendation')
      }
      
      const { recommendation } = await response.json()
      setRecommendation(recommendation)
      setTableState('recommended')
    } catch (error) {
      console.error('Failed to get recommendation:', error)
    } finally {
      setIsLoadingRecommendation(false)
    }
  }

  // Show next column
  const handleShowNextColumn = useCallback(() => {
    setVisibleColumnCount(prev => Math.min(prev + 1, columns.length))
    // Show recommendation when all columns are visible
    if (visibleColumnCount + 1 === columns.length && !recommendation) {
      setRecommendation(initialRecommendation)
      setTableState('recommended')
    }
  }, [columns.length, visibleColumnCount, recommendation, initialRecommendation])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuPosition(null)
      setSelectedText('')
    }
    
    if (menuPosition) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [menuPosition])

  // Handle text selection in notes view
  const handleTextSelection = () => {
    setTimeout(() => {
      const selection = window.getSelection()
      const text = selection?.toString() || ''
      
      if (text.trim().length > 0 && selection && selection.rangeCount > 0) {
        setSelectedText(text)
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setMenuPosition({
          x: rect.left,
          y: rect.bottom + window.scrollY + 8
        })
      } else {
        setSelectedText('')
        setMenuPosition(null)
      }
    }, 10)
  }

  // Convert notes to table
  const handleConvertToTable = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewMode('table')
    setSelectedText('')
    setMenuPosition(null)
  }

  // Handle clicking on upcoming column tag
  const handleRevealColumn = (columnIndex: number) => {
    setVisibleColumnCount(columnIndex + 1)
  }
  
  // Handle clicking on upcoming row tag
  const handleRevealRow = (universityId: string) => {
    // Find the index of the clicked university
    const clickedIndex = universities.findIndex(u => u.id === universityId)
    if (clickedIndex === -1) return
    
    // Swap the clicked university with the one at visibleRowCount position
    const updatedUniversities = [...universities]
    const temp = updatedUniversities[visibleRowCount]
    updatedUniversities[visibleRowCount] = updatedUniversities[clickedIndex]
    updatedUniversities[clickedIndex] = temp
    
    setUniversities(updatedUniversities)
    setVisibleRowCount(visibleRowCount + 1)
    setManualUniversityName("") // Clear manual input
  }
  
  // Show next row (accept AI suggestion)
  const handleAcceptSuggestedRow = () => {
    setVisibleRowCount(Math.min(visibleRowCount + 1, universities.length))
    setManualUniversityName("") // Clear manual input
  }
  
  // Handle manual university entry
  const handleManualUniversitySubmit = async () => {
    if (!manualUniversityName.trim()) return
    
    setIsLoadingManualUniversity(true)
    
    try {
      // Call API to fetch university data
      const response = await fetch('/api/fetch-university', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityName: manualUniversityName,
          columns: columns.filter(c => c.aiGenerated)
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch university data')
      }
      
      const { university: newUniversityData } = await response.json()
      
      // Create the new university
      const newUniversity: University = {
        id: universities[visibleRowCount]?.id || `${Date.now()}`,
        name: manualUniversityName,
        pros: newUniversityData.pros || "",
        cons: newUniversityData.cons || "",
        scores: newUniversityData.scores || {}
      }
      
      // Replace the preloaded university at the current position
      const updatedUniversities = [...universities]
      updatedUniversities[visibleRowCount] = newUniversity
      setUniversities(updatedUniversities)
      
      // Show the new row
      setVisibleRowCount(visibleRowCount + 1)
      setManualUniversityName("") // Clear input
      
    } catch (error) {
      console.error('Failed to fetch university data:', error)
    } finally {
      setIsLoadingManualUniversity(false)
    }
  }

  // Add a new row
  const handleAddRow = () => {
    const newUniversity: University = {
      id: `${Date.now()}`,
      name: "",
      pros: "",
      cons: "",
      scores: {}
    }
    setUniversities([...universities, newUniversity])
    setVisibleRowCount(universities.length + 1) // Make it visible immediately
  }

  // Helper: Parse partial JSON safely with aggressive extraction
  const tryParsePartialJSON = (text: string) => {
    try {
      // Try to parse complete JSON first
      return JSON.parse(text)
    } catch {
      // Try to extract complete sections
      const result: any = { topics: [], normalizedData: [] }
      
      // Extract topics array - more aggressive matching
      const topicsMatch = text.match(/"topics"\s*:\s*\[([\s\S]*?)(?:\],|\])/);
      if (topicsMatch) {
        try {
          const topicsStr = '[' + topicsMatch[1] + ']'
          result.topics = JSON.parse(topicsStr)
        } catch {
          // Extract individual topic objects
          const topicMatches = topicsMatch[1].matchAll(/\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"id"\s*:\s*"([^"]+)"\s*\}/g)
          result.topics = Array.from(topicMatches).map(match => ({
            name: match[1],
            id: match[2]
          }))
        }
      }
      
      // Extract normalizedData - look for complete university objects
      const dataMatch = text.match(/"normalizedData"\s*:\s*\[([\s\S]*)/);
      if (dataMatch) {
        const dataStr = dataMatch[1]
        
        // Try to find complete university entries with facts
        const uniPattern = /\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"name"\s*:\s*"([^"]+)"\s*,\s*"facts"\s*:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}\s*\}/g
        const matches = Array.from(dataStr.matchAll(uniPattern))
        
        result.normalizedData = matches.map(match => {
          try {
            const uniObj = `{"id":"${match[1]}","name":"${match[2]}","facts":{${match[3]}}}`
            return JSON.parse(uniObj)
          } catch (e) {
            // Try a more lenient parse
            const id = match[1]
            const name = match[2]
            const factsStr = match[3]
            
            // Extract facts for each topic
            const facts: any = {}
            const factPattern = /"(topic_\d+)"\s*:\s*\[([^\]]*)\]/g
            const factMatches = Array.from(factsStr.matchAll(factPattern))
            
            factMatches.forEach(fm => {
              const topicId = fm[1]
              const factsArrayStr = fm[2]
              try {
                facts[topicId] = JSON.parse('[' + factsArrayStr + ']')
              } catch {
                // Try to extract individual facts
                const factObjPattern = /\{\s*"text"\s*:\s*"([^"]+)"\s*,\s*"sentiment"\s*:\s*"([^"]+)"\s*\}/g
                const factObjs = Array.from(factsArrayStr.matchAll(factObjPattern))
                facts[topicId] = factObjs.map(fo => ({
                  text: fo[1],
                  sentiment: fo[2]
                }))
              }
            })
            
            return { id, name, facts }
          }
        }).filter(Boolean)
      }
      
      return result
    }
  }

  // Clean up table - use preloaded data with smooth animation
  const handleCleanUp = async () => {
    if (!preloadedData) return
    
    setIsLoadingColumn(true)
    setCleanupPhase('creating')
    
    try {
      // Process each topic column one by one (in priority order)
      for (let i = 0; i < preloadedData.sortedTopics.length; i++) {
        const topic = preloadedData.sortedTopics[i]
        
        // Add the new column with category field
        setStreamingTopics(prev => [...prev, { ...topic, category: 'topic' as const }])
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Type data into this column for all universities
        const textMap: Record<string, Record<string, string>> = {}
        preloadedData.normalizedData.forEach((uni: any) => {
          if (uni.facts && uni.id) {
            if (!textMap[uni.id]) textMap[uni.id] = {}
            if (uni.facts[topic.id]) {
              textMap[uni.id][topic.id] = uni.facts[topic.id].map((f: any) => f.text).join('\n')
            }
          }
        })
        
        setStreamingText(prev => {
          const updated = { ...prev }
          Object.keys(textMap).forEach(uniId => {
            if (!updated[uniId]) updated[uniId] = {}
            updated[uniId][topic.id] = textMap[uniId][topic.id]
          })
          return updated
        })
        
        await new Promise(resolve => setTimeout(resolve, 400))
      }
      
      // Phase 4: Collapse old columns
      setCleanupPhase('collapsing')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Create final columns and apply to table (already sorted by priority)
      const newColumns: Column[] = [
        { id: 'name', name: 'School', weight: 1, aiGenerated: false, category: 'content' },
        ...preloadedData.sortedTopics.map((topic: any) => ({
          id: topic.id,
          name: topic.name,
          weight: 1,
          aiGenerated: false,
          category: 'topic' as const
        }))
      ]
      
      // Update universities with structured facts
      const updatedUniversities = universities.map((u, index) => {
        const normalizedUni = preloadedData.normalizedData.find((n: any) => n.id === u.id)
        if (normalizedUni && index < visibleRowCount) {
          return {
            ...u,
            facts: normalizedUni.facts
          }
        }
        return u
      })
      
      // Initialize priorities from AI suggestions based on emotional intensity
      const newPriorities: Record<string, 'low' | 'medium' | 'high'> = {}
      preloadedData.sortedTopics.forEach((topic: any) => {
        newPriorities[topic.id] = topic.priority || 'medium'
      })
      setColumnPriorities(newPriorities)
      
      setColumns(newColumns)
      setUniversities(updatedUniversities)
      setVisibleColumnCount(newColumns.length)
      setIsCleanedUp(true)
      
      setCleanupPhase('complete')
      
      // Store recommendation for later
      if (preloadedData.recommendation) {
        setRecommendation(preloadedData.recommendation)
      }
      if (preloadedData.title) {
        setCardTitle(preloadedData.title)
      }
      
      // Reset streaming state
      await new Promise(resolve => setTimeout(resolve, 100))
      setStreamingTopics([])
      setStreamingText({})
      
    } catch (error) {
      console.error('Failed to clean up table:', error)
      setCleanupPhase('idle')
    } finally {
      setIsLoadingColumn(false)
    }
  }
  
  // Helper to calculate score for a university (can use external topics and priorities)
  const calculateScoreForUniversity = (
    university: University, 
    topics: any[], 
    priorities: Record<string, 'low' | 'medium' | 'high'>
  ): number => {
    if (!university.facts) return 0
    
    let totalWeight = 0
    let weightedSum = 0
    
    topics.forEach(topic => {
      const priority = priorities[topic.id] || 'medium'
      const weight = priority === 'high' ? 3 : priority === 'medium' ? 2 : 1
      totalWeight += weight
      
      // Calculate score for this criterion based on sentiment
      const facts = university.facts?.[topic.id] || []
      let criterionScore = 0
      facts.forEach((fact: any) => {
        if (fact.sentiment === 'positive') criterionScore += 1
        if (fact.sentiment === 'negative') criterionScore -= 1
      })
      
      // Normalize to 0-10 scale (assuming max 5 facts per criterion)
      const normalizedScore = Math.max(0, Math.min(10, 5 + criterionScore))
      weightedSum += normalizedScore * weight
    })
    
    return totalWeight > 0 ? (weightedSum / totalWeight) : 0
  }
  
  // Calculate score for a university based on weighted criteria (using current state)
  const calculateScore = (university: University): number => {
    const criteriaColumns = columns.filter(c => c.category === 'topic')
    return calculateScoreForUniversity(university, criteriaColumns, columnPriorities)
  }
  
  // Export functions
  const handleExportCSV = () => {
    const displayColumns = getDisplayColumns()
    const csvHeaders = displayColumns.map(col => col.name).join(',')
    const csvRows = universities.map(uni => {
      return displayColumns.map(col => {
        if (col.id === 'name') return uni.name
        if (col.id === 'pros') return `"${uni.pros.replace(/"/g, '""')}"`
        if (col.id === 'cons') return `"${uni.cons.replace(/"/g, '""')}"`
        if (col.id === 'priority-notes') {
          const index = universities.indexOf(uni)
          if (index === 0) return '"Best option based on your priorities"'
          if (index === 1) return '"Strong alternative"'
          return '"Consider if priorities shift"'
        }
        if (col.category === 'topic' && uni.facts?.[col.id]) {
          return `"${uni.facts[col.id].map((f: any) => f.text).join('; ').replace(/"/g, '""')}"`
        }
        return uni.scores[col.id] || ''
      }).join(',')
    }).join('\n')
    
    const csv = `${csvHeaders}\n${csvRows}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'university-comparison.csv'
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const handleCopyToClipboard = () => {
    const displayColumns = getDisplayColumns()
    const headers = displayColumns.map(col => col.name).join('\t')
    const rows = universities.map(uni => {
      return displayColumns.map(col => {
        if (col.id === 'name') return uni.name
        if (col.id === 'pros') return uni.pros
        if (col.id === 'cons') return uni.cons
        if (col.id === 'priority-notes') {
          const index = universities.indexOf(uni)
          if (index === 0) return 'Best option based on your priorities'
          if (index === 1) return 'Strong alternative'
          return 'Consider if priorities shift'
        }
        if (col.category === 'topic' && uni.facts?.[col.id]) {
          return uni.facts[col.id].map((f: any) => f.text).join('; ')
        }
        return uni.scores[col.id] || ''
      }).join('\t')
    }).join('\n')
    
    const text = `${headers}\n${rows}`
    navigator.clipboard.writeText(text)
    setShowExportMenu(false)
  }

  // Handle prioritize - add priority column and sort rows
  const handlePrioritize = () => {
    // Add Ranking column at the end
    const columnsWithNotes = [
      ...columns,
      {
        id: 'priority-notes',
        name: 'Ranking',
        weight: 1,
        aiGenerated: false,
        category: 'content' as const
      }
    ]
    
    setColumns(columnsWithNotes)
    setVisibleColumnCount(columnsWithNotes.length)
    
    // Calculate scores and sort universities by score (highest first)
    const criteriaColumns = columns.filter(c => c.category === 'topic')
    const universitiesWithScores = universities.map(u => ({
      ...u,
      score: calculateScoreForUniversity(u, criteriaColumns, columnPriorities)
    }))
    
    const sortedUniversities = [...universitiesWithScores].sort((a, b) => (b.score || 0) - (a.score || 0))
    setUniversities(sortedUniversities)
    
    setIsPrioritized(true)
  }
  
  // Column drag handlers
  const handleColumnDragStart = (columnId: string) => {
    setDraggedColumnId(columnId)
  }
  
  const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumnId(columnId)
  }
  
  const handleColumnDrop = (targetColumnId: string) => {
    if (!draggedColumnId || draggedColumnId === targetColumnId) {
      setDraggedColumnId(null)
      setDragOverColumnId(null)
      return
    }
    
    // Reorder columns
    const newColumns = [...columns]
    const draggedIndex = newColumns.findIndex(c => c.id === draggedColumnId)
    const targetIndex = newColumns.findIndex(c => c.id === targetColumnId)
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedColumnId(null)
      setDragOverColumnId(null)
      return
    }
    
    const [removed] = newColumns.splice(draggedIndex, 1)
    newColumns.splice(targetIndex, 0, removed)
    
    setColumns(newColumns)
    setDraggedColumnId(null)
    setDragOverColumnId(null)
  }
  
  const handleColumnDragEnd = () => {
    setDraggedColumnId(null)
    setDragOverColumnId(null)
  }
  
  // Row drag handlers
  const handleRowDragStart = (e: React.DragEvent, rowIndex: number) => {
    // Don't allow dragging if user is interacting with input/textarea
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('input, textarea')) {
      e.preventDefault()
      return
    }
    setDraggedRowIndex(rowIndex)
  }
  
  const handleRowDragOver = (e: React.DragEvent, rowIndex: number) => {
    e.preventDefault()
    setDragOverRowIndex(rowIndex)
  }
  
  const handleRowDrop = (targetRowIndex: number) => {
    if (draggedRowIndex === null || draggedRowIndex === targetRowIndex) {
      setDraggedRowIndex(null)
      setDragOverRowIndex(null)
      return
    }
    
    // Reorder universities
    const newUniversities = [...universities]
    const [removed] = newUniversities.splice(draggedRowIndex, 1)
    newUniversities.splice(targetRowIndex, 0, removed)
    
    setUniversities(newUniversities)
    setDraggedRowIndex(null)
    setDragOverRowIndex(null)
  }
  
  const handleRowDragEnd = () => {
    setDraggedRowIndex(null)
    setDragOverRowIndex(null)
  }
  
  // Get columns to display based on current state
  const getDisplayColumns = () => {
    // During cleanup animation phases
    if (cleanupPhase === 'creating') {
      return [
        { id: 'name', name: 'School', category: 'content' as const },
        { id: 'pros', name: 'Pros', category: 'content' as const },
        { id: 'cons', name: 'Cons', category: 'content' as const },
        ...streamingTopics
      ]
    }
    
    if (cleanupPhase === 'collapsing') {
      return [
        { id: 'name', name: 'School', category: 'content' as const },
        ...streamingTopics
      ]
    }
    
    // Default: show all visible columns
    return visibleColumns
  }
  
  // Toggle column priority
  const toggleColumnPriority = (columnId: string) => {
    const current = columnPriorities[columnId] || 'medium'
    const next = current === 'low' ? 'medium' : current === 'medium' ? 'high' : 'low'
    const newPriorities: Record<string, 'low' | 'medium' | 'high'> = { ...columnPriorities, [columnId]: next }
    
    // Update priorities
    setColumnPriorities(newPriorities)
    
    // Recalculate scores and re-sort universities
    const criteriaColumns = columns.filter(c => c.category === 'topic')
    const universitiesWithNewScores = universities.map(u => ({
      ...u,
      score: calculateScoreForUniversity(u, criteriaColumns, newPriorities)
    }))
    
    const sortedUniversities = [...universitiesWithNewScores].sort((a, b) => (b.score || 0) - (a.score || 0))
    setUniversities(sortedUniversities)
  }

  // Get priority dots with animation
  const getPriorityDots = (priority: 'low' | 'medium' | 'high' | undefined) => {
    const currentPriority = priority || 'medium'
    const dotClass = "w-[3px] h-[3px] rounded-full bg-current absolute transition-all duration-300 ease-in-out"
    
    // Calculate positions for each dot based on priority
    const getPositions = () => {
      if (currentPriority === 'low') {
        // All dots centered (stacked)
        return {
          dot1: 'translate-x-0 translate-y-0',
          dot2: 'translate-x-0 translate-y-0',
          dot3: 'translate-x-0 translate-y-0'
        }
      } else if (currentPriority === 'medium') {
        // 2 dots side by side, 3rd dot hidden behind 2nd
        return {
          dot1: '-translate-x-[2.5px] translate-y-0',
          dot2: 'translate-x-[2.5px] translate-y-0',
          dot3: 'translate-x-[2.5px] translate-y-0'
        }
      } else {
        // Triangle: dot 1 on top, dots 2 & 3 on bottom
        return {
          dot1: 'translate-x-0 -translate-y-[2px]',
          dot2: '-translate-x-[2.5px] translate-y-[2px]',
          dot3: 'translate-x-[2.5px] translate-y-[2px]'
        }
      }
    }
    
    const positions = getPositions()
    
    return (
      <div className="relative w-[12px] h-[12px] flex items-center justify-center">
        <div className={`${dotClass} ${positions.dot1}`} />
        <div className={`${dotClass} ${positions.dot2}`} />
        <div className={`${dotClass} ${positions.dot3}`} />
      </div>
    )
  }

  // Update weight for a column
  const handleUpdateWeight = (columnId: string, weight: number) => {
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, weight } : col
    ))
  }
  
  // Complete the model and show recommendation
  const handleCompleteModel = async () => {
    setIsLoadingRecommendation(true)
    setTablePhase('complete')
    
    try {
      const response = await fetch('/api/generate-model-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universities: universities.slice(0, visibleRowCount).map(u => ({
            name: u.name,
            pros: u.pros,
            cons: u.cons,
            scores: u.scores,
            totalScore: calculateTotalScore(u, visibleColumns)
          })),
          columns: visibleColumns.filter(c => c.aiGenerated)
        })
      })
      
      if (!response.ok) {
        console.error('API response not OK. Status:', response.status, response.statusText)
        const text = await response.text()
        console.error('Response body:', text)
        let errorData: any = { error: 'Unknown error' }
        try {
          errorData = JSON.parse(text)
        } catch (e) {
          console.error('Failed to parse error response as JSON')
        }
        throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Received data:', data)
      setCardTitle(data.title || 'Choosing a University')
      setRecommendation(data.recommendation || '')
      setModelSummary('')
    } catch (error) {
      console.error('Failed to generate recommendation:', error)
    } finally {
      setIsLoadingRecommendation(false)
    }
  }
  
  // Return to table view
  const handleBackToTable = () => {
    setTablePhase('ready')
  }

  // Update score for a specific university and column
  const handleUpdateScore = (universityId: string, columnId: string, score: number) => {
    setUniversities(universities.map(u =>
      u.id === universityId
        ? { ...u, scores: { ...u.scores, [columnId]: score } }
        : u
    ))
  }

  const allUniversitiesHaveData = universities.every(u => u.name.trim() && (u.pros.trim() || u.cons.trim()))

  return (
    <div className="flex min-h-screen flex-col items-start justify-start p-12 relative" style={{ backgroundColor: '#FCF9F6' }}>
      {/* Loading Dot - Show while preloading */}
      {isPreloading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center">
          <div 
            className="w-2 h-2 rounded-full bg-foreground"
            style={{
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        </div>
      )}
      
      {!isPreloading && viewMode === 'notes' ? (
        <div className="w-full max-w-3xl relative">
          <div 
            className="prose prose-lg whitespace-pre-wrap leading-relaxed cursor-text select-auto"
            onMouseUp={handleTextSelection}
            style={{ color: 'oklch(0.145 0 0)' }}
          >
            {unstructuredNotes}
          </div>
          
          {/* Selection Menu */}
          {menuPosition && selectedText && (
            <div
              className="fixed z-50"
              style={{
                left: `${menuPosition.x}px`,
                top: `${menuPosition.y}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inline-flex border border-border rounded-[99999px] overflow-hidden" style={{ backgroundColor: '#FCF9F6' }}>
                <div
                  className="text-[10px] px-1.5 py-1 cursor-pointer hover:bg-foreground/5 transition-colors whitespace-nowrap"
                  onClick={handleConvertToTable}
                >
                  Make a table
                </div>
                <div
                  className="text-[10px] px-1.5 py-1 cursor-pointer hover:bg-foreground/5 transition-colors whitespace-nowrap"
                  onClick={(e) => {
                    e.stopPropagation()
                    alert('Revise functionality coming soon!')
                  }}
                >
                  Revise
                </div>
                <div
                  className="text-[10px] px-1.5 py-1 cursor-pointer hover:bg-foreground/5 transition-colors whitespace-nowrap"
                  onClick={(e) => {
                    e.stopPropagation()
                    alert('Expand functionality coming soon!')
                  }}
                >
                  Expand
                </div>
              </div>
            </div>
          )}
        </div>
      ) : !isPreloading ? (
        <div className="w-full max-w-7xl flex justify-start">
          {/* Unified Card - Contains both table and recommendation */}
          <Card className={`transition-all duration-500 border-none shadow-none ${
          tablePhase === 'complete' ? 'w-[600px] p-0' : 'w-fit bg-transparent p-0'
        }`} style={tablePhase === 'complete' ? { backgroundColor: '#FEFDFC' } : undefined}>
          <CardContent className="p-0 m-0">
            {tablePhase === 'complete' ? (
              <>
              {/* Side-by-side layout */}
              <div className="flex gap-0">
                {/* Left: Title, Recommendation, and Actions */}
                <div className="space-y-3 flex-1 p-4">
                  <h3 className="text-lg font-semibold">{cardTitle}</h3>
                  <p className="text-sm text-foreground leading-relaxed">{recommendation || "Loading recommendation..."}</p>
                  
                  {/* Mini Table Card */}
                  <div 
                    className="inline-flex items-center gap-1.5 px-2 py-1 border border-border rounded cursor-pointer hover:border-foreground transition-colors w-fit"
                    onClick={handleBackToTable}
                    title="Back to Table"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="9" x2="9" y2="21" />
                    </svg>
                    <span className="text-xs text-foreground whitespace-nowrap">Universities</span>
                  </div>
                </div>
                
                {/* Right: Chart */}
                <div className="w-fit">
                  <ChartContainer
                    config={
                      universities.slice(0, visibleRowCount).reduce((acc, university, index) => {
                        // Brand colors for each university
                        const universityColors: Record<string, string> = {
                          'Stanford': '#8C1515',        // Cardinal red
                          'MIT': '#A31F34',             // MIT red/maroon
                          'UC Berkeley': '#003262',     // Berkeley blue
                          'Carnegie Mellon': '#C41230', // Carnegie red
                          'Georgia Tech': '#B3A369',    // Tech gold
                        }
                        
                        // Fallback slate colors
                        const defaultColors = [
                          '#64748b', // slate-500
                          '#475569', // slate-600
                          '#334155', // slate-700
                          '#1e293b', // slate-800
                          '#0f172a', // slate-900
                        ]
                        
                        acc[university.name] = {
                          label: university.name,
                          color: universityColors[university.name] || defaultColors[index % defaultColors.length],
                        }
                        return acc
                      }, {} as ChartConfig)
                    }
                    className="h-[240px] w-[300px]"
                  >
                    <RadarChart
                      data={visibleColumns
                        .filter(col => col.aiGenerated)
                        .map(column => {
                          const dataPoint: any = { criterion: simplifyLabel(column.name) }
                          universities.slice(0, visibleRowCount).forEach(university => {
                            dataPoint[university.name] = university.scores[column.id] || 0
                          })
                          return dataPoint
                        })}
                      margin={{ top: 5, right: -30, bottom: 5, left: -30 }}
                    >
                      <PolarGrid strokeLinecap="round" strokeLinejoin="round" />
                      <PolarAngleAxis dataKey="criterion" tick={CustomAngleTick} />
                      <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      {universities.slice(0, visibleRowCount).map((university, index) => {
                        // Brand colors for each university
                        const universityColors: Record<string, string> = {
                          'Stanford': '#8C1515',        // Cardinal red
                          'MIT': '#A31F34',             // MIT red/maroon
                          'UC Berkeley': '#003262',     // Berkeley blue
                          'Carnegie Mellon': '#C41230', // Carnegie red
                          'Georgia Tech': '#B3A369',    // Tech gold
                        }
                        
                        // Fallback slate colors
                        const defaultColors = [
                          '#64748b', // slate-500
                          '#475569', // slate-600
                          '#334155', // slate-700
                          '#1e293b', // slate-800
                          '#0f172a', // slate-900
                        ]
                        
                        const color = universityColors[university.name] || defaultColors[index % defaultColors.length]
                        
                        return (
                          <Radar
                            key={university.name}
                            name={university.name}
                            dataKey={university.name}
                            stroke={color}
                            fill="none"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            dot={false}
                          />
                        )
                      })}
                    </RadarChart>
                  </ChartContainer>
                </div>
              </div>
              </>
            ) : (
              <>
            {/* Main Table with L-shaped navigation */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setIsHoveringTable(true)
                setIsHoveringTableMenu(false)
                setIsHoveringRowMenu(false)
                setIsHoveringColumnMenu(false)
              }}
              onMouseLeave={() => setIsHoveringTable(false)}
            >
              {/* Table Menu - appears when table is ready */}
              {tablePhase === 'ready' && (
                <div 
                  className={`absolute inline-flex border-t border-l border-r overflow-hidden transition-all duration-300 ${
                    isHoveringTableMenu ? 'border-foreground/30' : 'border-border'
                  }`}
                  style={{
                    left: '6px',
                    bottom: '100%',
                    transform: isHoveringTable && (!isHoveringRowMenu && !isHoveringColumnMenu || isHoveringTableMenu) ? 'translateY(0)' : 'translateY(200%)',
                    backgroundColor: '#FCF9F6',
                    zIndex: 0,
                    borderTopLeftRadius: '0.375rem',
                    borderTopRightRadius: '0.375rem',
                  }}
                  onMouseEnter={() => setIsHoveringTableMenu(true)}
                  onMouseLeave={() => setIsHoveringTableMenu(false)}
                >
                  {!isCleanedUp && (
                    <div 
                      className="text-[10px] px-2 py-1 whitespace-nowrap cursor-pointer transition-colors text-muted-foreground hover:text-foreground"
                      onClick={handleCleanUp}
                    >
                      {isLoadingColumn ? 'Organizing...' : 'Organize'}
                    </div>
                  )}
                  {isCleanedUp && (
                    <div className="relative">
                      <div 
                        className="text-[10px] px-2 py-1 whitespace-nowrap cursor-pointer transition-colors text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowExportMenu(!showExportMenu)
                        }}
                      >
                        Export
                      </div>
                      {showExportMenu && (
                        <div 
                          className="absolute left-0 bottom-full mb-1 bg-background border border-border rounded-lg shadow-lg py-1 whitespace-nowrap z-50"
                          style={{ backgroundColor: '#FCF9F6' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div 
                            className="text-[10px] px-3 py-1.5 cursor-pointer hover:bg-foreground/5 transition-colors"
                            onClick={handleExportCSV}
                          >
                            Download CSV
                          </div>
                          <div 
                            className="text-[10px] px-3 py-1.5 cursor-pointer hover:bg-foreground/5 transition-colors"
                            onClick={handleCopyToClipboard}
                          >
                            Copy to clipboard
                          </div>
                          <div 
                            className="text-[10px] px-3 py-1.5 cursor-pointer hover:bg-foreground/5 transition-colors text-muted-foreground"
                            onClick={() => setShowExportMenu(false)}
                          >
                            Import to Asana (coming soon)
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            
                {/* Main Table */}
                <div 
                  className={`relative border rounded-md z-10 transition-all duration-500 ease-in-out ${
                    isHoveringTableMenu ? 'border-foreground/30' : 'border-border'
                  }`} 
                  style={{ backgroundColor: '#FCF9F6' }}
                >
          <Table className="w-auto table-fixed transition-all duration-500 ease-in-out">
            <TableHeader>
              <TableRow>
                {/* Show columns based on current state */}
                {getDisplayColumns().map((column, index) => {
                  const allColumns = getDisplayColumns()
                  const isLastColumn = index === allColumns.length - 1
                  return (
                    <TableHead
                      key={column.id}
                      draggable={column.id !== 'name' && column.id !== 'priority-notes'}
                      onDragStart={() => handleColumnDragStart(column.id)}
                      onDragOver={(e) => handleColumnDragOver(e, column.id)}
                      onDrop={() => handleColumnDrop(column.id)}
                      onDragEnd={handleColumnDragEnd}
                      className={`h-auto py-2 px-4 transition-all duration-300 ${!isLastColumn ? 'border-r border-border' : ''} ${
                        column.id === 'name' ? 'w-32' : 
                        (column.id === 'pros' || column.id === 'cons') ? 'w-56' :
                        column.id === 'priority-notes' ? 'w-40' :
                        column.category === 'topic' ? 'w-40' :
                        'w-24'
                      } ${draggedColumnId === column.id ? 'opacity-50' : ''} ${
                        dragOverColumnId === column.id && draggedColumnId && draggedColumnId !== column.id ? 'border-l-2 border-l-blue-500' : ''
                      } ${column.id !== 'name' && column.id !== 'priority-notes' ? 'cursor-move' : ''}`}
                    >
                      <div className="flex items-center gap-1 group">
                        <span>{column.name}</span>
                        {column.category === 'topic' && isCleanedUp && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleColumnPriority(column.id)
                            }}
                            className="h-5 w-5 p-0 rounded-full flex items-center justify-center hover:bg-muted/30"
                          >
                            {getPriorityDots(columnPriorities[column.id])}
                          </Button>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
                
                {/* Total Score Column */}
                {!hasMoreColumns && visibleColumns.some(c => c.aiGenerated) && tablePhase !== 'ready' && (
                  <TableHead className="text-right w-32 h-auto py-2 px-4">Total Score</TableHead>
                )}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {visibleUniversities.map((university, rowIndex) => (
                <TableRow
                  key={university.id}
                  draggable={true}
                  onDragStart={(e) => handleRowDragStart(e, rowIndex)}
                  onDragOver={(e) => handleRowDragOver(e, rowIndex)}
                  onDrop={() => handleRowDrop(rowIndex)}
                  onDragEnd={handleRowDragEnd}
                  className={`group transition-all duration-300 cursor-move ${
                    draggedRowIndex === rowIndex ? 'opacity-50' : ''
                  } ${
                    dragOverRowIndex === rowIndex && draggedRowIndex !== null && draggedRowIndex !== rowIndex 
                      ? 'border-t-2 border-t-blue-500' : ''
                  }`}
                >
                  {/* Show columns based on current state */}
                  {getDisplayColumns().map((column, colIndex) => {
                    const allColumns = getDisplayColumns()
                    const isLastColumn = colIndex === allColumns.length - 1
                    const hasStreamingData = cleanupPhase === 'creating' && 
                                           streamingFacts[university.id]?.[column.id]
                    return (
                      <TableCell 
                        key={column.id} 
                        className={`align-top whitespace-normal break-words py-2 px-4 transition-all duration-300 ${!isLastColumn ? 'border-r border-border' : ''}`}
                      >
                      {column.id === 'name' ? (
                        <Input
                          value={university.name}
                          onChange={(e) => {
                            const updated = [...universities]
                            updated[rowIndex].name = e.target.value
                            setUniversities(updated)
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          draggable={false}
                          className="border-none shadow-none p-0 h-auto focus-visible:ring-0"
                          placeholder="School name"
                        />
                      ) : column.category === 'topic' ? (
                        <div className="space-y-0.5 text-sm min-h-[20px]">
                          {/* During creating/collapsing: show streaming text in black */}
                          {(cleanupPhase === 'creating' || cleanupPhase === 'collapsing') && streamingText[university.id]?.[column.id] ? (
                            <div
                              className="whitespace-pre-wrap text-foreground"
                            >
                              {streamingText[university.id][column.id]}
                            </div>
                          ) : (cleanupPhase === 'creating' || cleanupPhase === 'collapsing') ? (
                            // During creating/collapsing but no data yet: show nothing (empty cell)
                            null
                          ) : (cleanupPhase === 'complete' || cleanupPhase === 'idle') && university.facts?.[column.id] ? (
                            // After complete: show final facts in black
                            university.facts[column.id].map((fact: any, factIndex: number) => (
                              <div
                                key={factIndex}
                                className="text-foreground"
                              >
                                {fact.text}
                              </div>
                            ))
                          ) : (cleanupPhase === 'complete') && (!university.facts?.[column.id] || university.facts[column.id].length === 0) ? (
                            <div className="text-muted-foreground text-xs">No data</div>
                          ) : null}
                        </div>
                      ) : column.id === 'pros' ? (
                        <div>
                          <Textarea
                            value={university.pros}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                              const updated = [...universities]
                              updated[rowIndex].pros = e.target.value
                              setUniversities(updated)
                              // Auto-resize
                              const target = e.currentTarget
                              target.style.height = 'auto'
                              target.style.height = target.scrollHeight + 'px'
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            draggable={false}
                            className="border-none shadow-none p-0 h-auto focus-visible:ring-0 resize-none min-h-0 overflow-hidden"
                            placeholder="Add pros..."
                            ref={(el) => {
                              if (el) {
                                el.style.height = 'auto'
                                el.style.height = el.scrollHeight + 'px'
                              }
                            }}
                          />
                        </div>
                      ) : column.id === 'cons' ? (
                        <div>
                          <Textarea
                            value={university.cons}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                              const updated = [...universities]
                              updated[rowIndex].cons = e.target.value
                              setUniversities(updated)
                              // Auto-resize
                              const target = e.currentTarget
                              target.style.height = 'auto'
                              target.style.height = target.scrollHeight + 'px'
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            draggable={false}
                            className="border-none shadow-none p-0 h-auto focus-visible:ring-0 resize-none min-h-0 overflow-hidden"
                            placeholder="Add cons..."
                            ref={(el) => {
                              if (el) {
                                el.style.height = 'auto'
                                el.style.height = el.scrollHeight + 'px'
                              }
                            }}
                          />
                        </div>
                      ) : column.id === 'priority-notes' ? (
                        <div className="text-sm text-foreground">
                          {rowIndex === 0 ? (
                            <span>Best option based on your priorities</span>
                          ) : rowIndex === 1 ? (
                            <span>Strong alternative</span>
                          ) : (
                            <span>Consider if priorities shift</span>
                          )}
                        </div>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={university.scores[column.id] || 0}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(10, parseInt(e.target.value) || 0))
                            handleUpdateScore(university.id, column.id, value)
                          }}
                          className="w-16 border-none shadow-none p-0 h-auto focus-visible:ring-0"
                        />
                      )}
                    </TableCell>
                    )
                  })}
                  
                  {/* Total Score Cell */}
                  {!hasMoreColumns && visibleColumns.some(c => c.aiGenerated) && tablePhase !== 'ready' && (
                    <TableCell className="text-right align-top w-32 whitespace-normal break-words py-2 px-4">
                      {calculateTotalScore(university) || '-'}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              
            </TableBody>
          </Table>
        </div>
        
        {/* Horizontal bar for upcoming universities */}
        <div 
          className={`absolute inline-flex items-center border-b border-l border-r overflow-hidden transition-all duration-300 ${
            isHoveringRowMenu ? 'border-foreground/30' : 'border-border'
          }`}
          style={{
            left: '6px',
            top: '100%',
            transform: isHoveringTable && (!isHoveringTableMenu && !isHoveringColumnMenu || isHoveringRowMenu) ? 'translateY(0)' : 'translateY(-200%)',
            backgroundColor: '#FCF9F6',
            zIndex: 0,
            borderBottomLeftRadius: '0.375rem',
            borderBottomRightRadius: '0.375rem',
          }}
          onMouseEnter={() => setIsHoveringRowMenu(true)}
          onMouseLeave={() => setIsHoveringRowMenu(false)}
        >
          <div
            className="w-5 h-5 rounded-full cursor-pointer transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (upcomingUniversities.length > 0) {
                handleRevealRow(upcomingUniversities[0].id)
              }
            }}
          >
            <Plus className="h-3 w-3" />
          </div>
          {upcomingUniversities.map((university) => (
            <div
              key={university.id}
              className="text-[10px] px-2 py-1 cursor-pointer transition-colors whitespace-nowrap text-muted-foreground hover:text-foreground"
              onClick={() => handleRevealRow(university.id)}
            >
              {university.name}
            </div>
          ))}
        </div>
        
        {/* Vertical bar for adding columns */}
        <div 
          className={`absolute flex flex-col border-t border-r border-b overflow-hidden transition-all duration-300 ${
            isHoveringColumnMenu ? 'border-foreground/30' : 'border-border'
          }`}
          style={{
            top: '6px',
            left: '100%',
            transform: isHoveringTable && (!isHoveringTableMenu && !isHoveringRowMenu || isHoveringColumnMenu) ? 'translateX(0)' : 'translateX(-200%)',
            backgroundColor: '#FCF9F6',
            zIndex: 0,
            borderTopRightRadius: '0.375rem',
            borderBottomRightRadius: '0.375rem',
          }}
          onMouseEnter={() => setIsHoveringColumnMenu(true)}
          onMouseLeave={() => setIsHoveringColumnMenu(false)}
        >
          <div
            className="w-5 h-5 rounded-full cursor-pointer transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={() => {
              // For now, just reveal next column if available
              if (hasMoreColumns) {
                handleRevealColumn(visibleColumnCount)
              }
            }}
            title="Add column"
          >
            <Plus className="h-3 w-3" />
          </div>
          {isCleanedUp && !isPrioritized && (
            <div
              className="text-[10px] px-2 py-1 cursor-pointer transition-colors whitespace-nowrap border-t border-border text-muted-foreground hover:text-foreground"
              onClick={handlePrioritize}
              title="Add rank column and sort by weighted criteria"
            >
              Rank
            </div>
          )}
        </div>
      </div>
              </>
            )}
          </CardContent>
        </Card>
        </div>
      ) : null}
      <ExperimentNav />
    </div>
  )
}
