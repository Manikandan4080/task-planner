import { useState, useRef } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, differenceInDays, addDays } from "date-fns"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Task, TaskCategory, TimeFilter } from "@/types/Task/taskType"
import TaskStrip from "./TaskStrip"

interface CalendarProps {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  tasks: Task[]
  categoryFilters: TaskCategory[]
  timeFilter: TimeFilter
  userFilters: string[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onDragSelection: (startDate: Date, endDate: Date) => void
  dragSelection: {
    startDate: Date | null
    endDate: Date | null
    isSelecting: boolean
  }
  setDragSelection: (selection: any) => void
}

export function Calendar({
  currentDate,
  setCurrentDate,
  tasks,
  categoryFilters,
  timeFilter,
  userFilters,
  onTaskUpdate,
  onTaskEdit,
  onTaskDelete,
  onDragSelection,
  dragSelection,
  setDragSelection
}: CalendarProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null)
  const [resizingTask, setResizingTask] = useState<{
    task: Task
    mode: 'left' | 'right'
    originalDate: Date
  } | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const filteredTasks = tasks.filter(task => {
    // Category filter
    if (!categoryFilters.includes(task.category)) return false
    
    // User filter
    if (!userFilters.includes(task.assignedUser)) return false
    
    // Time filter
    if (timeFilter !== "all") {
      const now = new Date()
      const daysDiff = Math.ceil((task.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 1000))
      
      switch (timeFilter) {
        case "1week":
          return daysDiff <= 7
        case "2weeks":
          return daysDiff <= 14
        case "3weeks":
          return daysDiff <= 21
        default:
          return true
      }
    }
    
    return true
  })

  // Group tasks by week rows for proper rendering
  const getTasksForWeek = (weekStart: Date) => {
    const weekDays = eachDayOfInterval({ 
      start: weekStart, 
      end: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000) 
    })
    
    return filteredTasks.filter(task => {
      return weekDays.some(day => day >= task.startDate && day <= task.endDate)
    })
  }

  const handleMouseDown = (day: Date, _: React.MouseEvent) => {
    if (draggedTask || resizingTask) return // Don't start selection if dragging/resizing a task
    
    setIsDragging(true)
    setDragSelection({
      startDate: day,
      endDate: day,
      isSelecting: true
    })
  }

  const handleMouseEnter = (day: Date) => {
    setHoveredDay(day)
    
    if (isDragging && dragSelection.startDate && !draggedTask && !resizingTask) {
      const start = dragSelection.startDate
      const end = day
      setDragSelection({
        startDate: start <= end ? start : end,
        endDate: start <= end ? end : start,
        isSelecting: true
      })
    }
    
    // Handle task resizing by hovering over days
    if (resizingTask) {
      if (resizingTask.mode === 'right') {
        // Extending end date - day should be >= start date
        if (day >= resizingTask.task.startDate) {
          onTaskUpdate(resizingTask.task.id, { endDate: day })
        }
      } else if (resizingTask.mode === 'left') {
        // Extending start date - day should be <= end date
        if (day <= resizingTask.task.endDate) {
          onTaskUpdate(resizingTask.task.id, { startDate: day })
        }
      }
    }
  }

  const handleMouseUp = () => {
    if (isDragging && dragSelection.startDate && dragSelection.endDate && !draggedTask && !resizingTask) {
      onDragSelection(dragSelection.startDate, dragSelection.endDate)
    }
    
    if (draggedTask && hoveredDay) {
      handleTaskDrop(hoveredDay)
    }
    
    // End task resizing
    if (resizingTask) {
      setResizingTask(null)
    }
    
    setIsDragging(false)
    setDraggedTask(null)
    setHoveredDay(null)
  }

  const handleTaskDragStart = (task: Task, dayClicked: Date) => {
    setDraggedTask(task)
    // Calculate offset from task start to clicked day
    const offset = differenceInDays(dayClicked, task.startDate)
    setDragOffset(offset)
  }

  const handleTaskResizeStart = (task: Task, mode: 'left' | 'right') => {
    setResizingTask({
      task,
      mode,
      originalDate: mode === 'right' ? task.endDate : task.startDate
    })
  }

  const handleTaskDrop = (targetDay: Date) => {
    if (draggedTask) {
      const taskDuration = differenceInDays(draggedTask.endDate, draggedTask.startDate)
      // Apply the offset to maintain the relative position where user clicked
      const newStartDate = addDays(targetDay, -dragOffset)
      const newEndDate = addDays(newStartDate, taskDuration)
      
      onTaskUpdate(draggedTask.id, { 
        startDate: newStartDate, 
        endDate: newEndDate 
      })
    }
  }

  const isInSelection = (day: Date) => {
    if (!dragSelection.isSelecting || !dragSelection.startDate || !dragSelection.endDate) {
      return false
    }
    return day >= dragSelection.startDate && day <= dragSelection.endDate
  }

  const isInResizePreview = (day: Date) => {
    if (!resizingTask) return false
    
    if (resizingTask.mode === 'right') {
      return day >= resizingTask.task.startDate && day <= (hoveredDay || resizingTask.task.endDate)
    } else {
      return day >= (hoveredDay || resizingTask.task.startDate) && day <= resizingTask.task.endDate
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  // Split days into weeks for proper task strip rendering
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between p-6 border-b bg-background">
        <h1 className="text-2xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'MMM yyyy')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentDate(new Date())}
          className="text-xs px-3"
        >
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div 
          ref={calendarRef}
          className="select-none p-2 lg:p-6 min-w-[320px]"
          data-calendar-container
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false)
            setDraggedTask(null)
            setHoveredDay(null)
            setResizingTask(null)
          }}
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0.5 lg:gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-muted-foreground text-xs lg:text-sm">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Weeks */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="relative mb-1">
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-0.5 lg:gap-1">
                {week.map(day => {
                  const isCurrentMonth = day >= monthStart && day <= monthEnd
                  const isSelected = isInSelection(day)
                  const isHovered = hoveredDay && isSameDay(day, hoveredDay)
                  const isDropTarget = draggedTask && isHovered
                  const isResizePreview = isInResizePreview(day)

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "min-h-[100px] lg:min-h-[140px] p-1 lg:p-1 border border-border cursor-pointer relative transition-colors", 
                        !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                        isToday(day) && "bg-primary/10 border-primary",
                        isSelected && "bg-blue-100 border-blue-300",
                        isDropTarget && "bg-green-100 border-green-400 border-2",
                        isResizePreview && "bg-orange-100 border-orange-300 border-2",
                        resizingTask && "cursor-crosshair"
                      )}
                      onMouseDown={(e) => handleMouseDown(day, e)}
                      onMouseEnter={() => handleMouseEnter(day)}
                    >
                      <div className="text-sm font-medium mb-1 p-1">
                        {format(day, 'd')}
                      </div>
                      
                      {/* Drop indicator */}
                      {isDropTarget && (
                        <div className="absolute inset-0 bg-green-200/50 border-2 border-dashed border-green-400 rounded pointer-events-none flex items-center justify-center">
                          <span className="text-green-700 font-medium text-xs hidden sm:inline">Drop here</span>
                        </div>
                      )}
                      
                      {/* Resize preview indicator */}
                      {isResizePreview && (
                        <div className="absolute inset-0 bg-orange-200/50 border-2 border-dashed border-orange-400 rounded pointer-events-none flex items-center justify-center">
                          <span className="text-orange-700 font-medium text-xs hidden sm:inline">
                            {resizingTask?.mode === 'right' ? 'Extend to' : 'Start from'}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Task strips for this week */}
              <div className="absolute top-0 left-0 right-0 pointer-events-none">
                {getTasksForWeek(week[0]).map((task, taskIndex) => (
                  <TaskStrip
                    key={task.id}
                    task={task}
                    weekStart={week[0]}
                    weekDays={week}
                    taskIndex={taskIndex}
                    onTaskUpdate={onTaskUpdate}
                    onTaskEdit={onTaskEdit}
                    onTaskDelete={onTaskDelete}
                    onDragStart={handleTaskDragStart}
                    onResizeStart={handleTaskResizeStart}
                    isDragging={draggedTask?.id === task.id}
                    isResizing={resizingTask?.task.id === task.id}
                    allWeekDays={days}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
