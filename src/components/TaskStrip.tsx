import { useState, useRef, useEffect } from "react"
import { format, isSameDay, addDays, max, min } from "date-fns"
import { GripVertical, User } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Task } from "@/types/Task/taskType"

interface TaskStripProps {
  task: Task
  weekStart: Date
  weekDays: Date[]
  taskIndex: number
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onDragStart: (task: Task, dayClicked: Date) => void
  onResizeStart: (task: Task, mode: 'left' | 'right') => void
  isDragging: boolean
  isResizing: boolean
  allWeekDays: Date[]
}

const priorityColors = {
  "P0": "bg-red-500",
  "P1": "bg-orange-500",
  "P2": "bg-yellow-500"
}

const taskColors = {
  "blue": "bg-blue-500",
  "green": "bg-green-500",
  "purple": "bg-purple-500",
  "orange": "bg-orange-500",
  "red": "bg-red-500",
  "pink": "bg-pink-500",
  "indigo": "bg-indigo-500",
  "teal": "bg-teal-500"
}

export default function TaskStrip({ 
  task, 
  weekStart, 
  weekDays, 
  taskIndex, 
  onTaskEdit, 
  onDragStart,
  onResizeStart,
  isDragging,
  isResizing,
}: TaskStripProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const [isDragStarted, setIsDragStarted] = useState(false)

  // Calculate which days of the week this task spans
  const weekEnd = weekDays[6]
  const taskStart = max([task.startDate, weekStart])
  const taskEnd = min([task.endDate, weekEnd])

  // Calculate position and width
  const startDayIndex = weekDays.findIndex(day => isSameDay(day, taskStart))
  const endDayIndex = weekDays.findIndex(day => isSameDay(day, taskEnd))

  if (startDayIndex === -1 || endDayIndex === -1) return null

  const leftPercent = (startDayIndex / 7) * 100
  const widthPercent = ((endDayIndex - startDayIndex + 1) / 7) * 100
  const topOffset = 25 + (taskIndex * 28) + (taskIndex*3) // Better spacing for mobile

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const rect = stripRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickX = e.clientX - rect.left
    const isLeftEdge = clickX < 10
    const isRightEdge = clickX > rect.width - 10

    if (isLeftEdge && isSameDay(taskStart, task.startDate)) {
      // Start left edge resizing
      onResizeStart(task, 'left')
      setIsDragStarted(true)
    } else if (isRightEdge && isSameDay(taskEnd, task.endDate)) {
      // Start right edge resizing
      onResizeStart(task, 'right')
      setIsDragStarted(true)
    } else {
      // Start dragging - pass the day that was clicked
      const clickedDayIndex = Math.floor((clickX / rect.width) * (endDayIndex - startDayIndex + 1))
      const clickedDay = addDays(taskStart, clickedDayIndex)
      onDragStart(task, clickedDay)
      setIsDragStarted(true)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only open edit modal if we didn't start dragging/resizing
    if (!isDragStarted) {
      onTaskEdit(task)
    }
  }

  // Reset drag started flag when dragging/resizing ends
  useEffect(() => {
    if (!isDragging && !isResizing) {
      setIsDragStarted(false)
    }
  }, [isDragging, isResizing])

  const isTaskStart = isSameDay(taskStart, task.startDate)
  const isTaskEnd = isSameDay(taskEnd, task.endDate)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={stripRef}
            className={cn(
              "absolute text-white px-2 flex gap-3 items-center justify-between cursor-pointer group pointer-events-auto shadow-sm transition-all hover:shadow-md",
              "h-6 lg:h-7 text-xs", // Consistent height
              taskColors[task.color],
              isDragging && "opacity-50 z-50 shadow-lg scale-105 cursor-move",
              isResizing && "opacity-75 z-50 shadow-lg ring-2 ring-orange-400 cursor-col-resize",
              // Rounded corners based on position
              isTaskStart && isTaskEnd && "rounded-full", // Single day task
              isTaskStart && !isTaskEnd && "rounded-l-full rounded-r-sm", // Start of multi-day task
              !isTaskStart && isTaskEnd && "rounded-l-sm rounded-r-full", // End of multi-day task
              !isTaskStart && !isTaskEnd && "rounded-sm", // Middle of multi-day task
            "pointer-events-none"
            )}
            style={{
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              top: `${topOffset}px`,
            }}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
          >
            {/* Left resize handle */}
            {isTaskStart && (
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 bg-white/20 pointer-events-auto",
                isTaskStart && isTaskEnd ? "rounded-l-full" : "rounded-l-full",
                isResizing && "opacity-100 bg-orange-300/50"
              )} />
            )}

            {isTaskStart && <div className="pointer-events-auto ml-2">
            <GripVertical className="w-4 h-4 text-gray-600 hover:text-gray-900" />
            </div>}
            
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {/* Priority badge */}
              <Badge 
                className={`${priorityColors[task.priority]} text-white px-1 py-0 rounded-full text-[10px] h-4 leading-none`}
              >
                {task.priority}
              </Badge>
              
              <span className="truncate flex-1 text-xs leading-none">
                {task.name}
              </span>
            </div>
            
            {isTaskStart && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                {/* User indicator - show on larger mobile screens */}
                <div className="hidden sm:flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="text-[10px] truncate max-w-[50px]">
                    {task.assignedUser.split(' ')[0]}
                  </span>
                </div>
              </div>
            )}
            
            {/* Right resize handle */}
            {isTaskEnd && (
              <div className={cn(
                "absolute right-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 bg-white/20 pointer-events-auto",
                isTaskStart && isTaskEnd ? "rounded-r-full" : "rounded-r-full",
                isResizing && "opacity-100 bg-orange-300/50"
              )} />
            )}
          </div>
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
            <div className="text-muted-foreground">
              Assigned: {task.assignedUser}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Badge className={`${priorityColors[task.priority]} text-white text-xs rounded-full`}>
                {task.priority}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {task.priority === "P0" ? "Critical" : task.priority === "P1" ? "High" : "Medium"}
              </span>
            </div>
            <div className="text-muted-foreground text-xs mt-1 space-y-1">
              <div>💡 Tap to edit task</div>
              <div className="hidden lg:block">💡 Drag edges to resize, middle to move</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
