import React, { useState, useRef, useEffect } from "react"
import { format, isSameDay, addDays } from "date-fns"
import { MoreHorizontal, Trash2, Edit } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Task } from "@/types/Task/taskType"

interface TaskBarProps {
  task: Task
  day: Date
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => void
}

const categoryColors = {
  "To Do": "bg-blue-500",
  "In Progress": "bg-yellow-500", 
  "Review": "bg-purple-500",
  "Completed": "bg-green-500"
}

export default function TaskBar({ task, day, onTaskUpdate, onTaskEdit, onTaskDelete }: TaskBarProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const taskRef = useRef<HTMLDivElement>(null)

  const isFirstDay = isSameDay(task.startDate, day)
  const isLastDay = isSameDay(task.endDate, day)
  const isOnlyDay = isFirstDay && isLastDay

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = taskRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickX = e.clientX - rect.left
    const isLeftEdge = clickX < 8
    const isRightEdge = clickX > rect.width - 8

    if (isLeftEdge && isFirstDay) {
      setIsResizing('left')
    } else if (isRightEdge && isLastDay) {
      setIsResizing('right')
    } else {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      // Handle task movement
      const deltaX = e.clientX - dragStart.x
      const dayWidth = 150 // Approximate day cell width
      const daysMoved = Math.round(deltaX / dayWidth)
      
      if (Math.abs(daysMoved) > 0) {
        const newStartDate = addDays(task.startDate, daysMoved)
        const newEndDate = addDays(task.endDate, daysMoved)
        onTaskUpdate(task.id, { startDate: newStartDate, endDate: newEndDate })
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    } else if (isResizing) {
      // Handle task resizing
      const deltaX = e.clientX - dragStart.x
      const dayWidth = 150
      const daysMoved = Math.round(deltaX / dayWidth)
      
      if (Math.abs(daysMoved) > 0) {
        if (isResizing === 'left') {
          const newStartDate = addDays(task.startDate, daysMoved)
          if (newStartDate <= task.endDate) {
            onTaskUpdate(task.id, { startDate: newStartDate })
          }
        } else if (isResizing === 'right') {
          const newEndDate = addDays(task.endDate, daysMoved)
          if (newEndDate >= task.startDate) {
            onTaskUpdate(task.id, { endDate: newEndDate })
          }
        }
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(null)
  }

  // Add global mouse event listeners with useEffect
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing])

  const taskContent = (
    <div
      ref={taskRef}
      className={cn(
        "relative h-6 rounded text-white text-xs px-2 flex items-center justify-between cursor-move group",
        categoryColors[task.category],
        isDragging && "opacity-50",
        isResizing && "cursor-col-resize"
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Left resize handle */}
      {isFirstDay && (
        <div className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 bg-white/20" />
      )}
      
      <span className="truncate flex-1">
        {isOnlyDay ? task.name : isFirstDay ? task.name : ''}
      </span>
      
      {isFirstDay && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded p-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onTaskEdit(task)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onTaskDelete(task.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {/* Right resize handle */}
      {isLastDay && (
        <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 bg-white/20" />
      )}
    </div>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {taskContent}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-medium">{task.name}</div>
            <div className="text-muted-foreground">
              {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
            </div>
            <div className="text-muted-foreground">
              Category: {task.category}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
