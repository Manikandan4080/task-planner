import { useState, useEffect } from "react"
import { generateId } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Filter,} from 'lucide-react'
import { cn } from "@/lib/utils"
import type { User } from "@/types/user/userType"
import type { Task, TaskCategory, TaskColor, TaskPriority, TimeFilter } from "@/types/Task/taskType"
import FilterSidebar from "./FilterSideBar"
import { Calendar } from "./Calender"
import TaskModal from "./TaskModal"

// Mock users data
const mockUsers: User[] = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Mike Johnson" },
  { id: "4", name: "Sarah Wilson" },
  { id: "5", name: "David Brown" }
]

export default function TaskPlanner() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [categoryFilters, setCategoryFilters] = useState<TaskCategory[]>([
    "To Do",
    "In Progress", 
    "Review",
    "Completed"
  ])
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all")
  const [userFilters, setUserFilters] = useState<string[]>(
    mockUsers.map(user => user.name)
  )
  const [dragSelection, setDragSelection] = useState<{
    startDate: Date | null
    endDate: Date | null
    isSelecting: boolean
  }>({
    startDate: null,
    endDate: null,
    isSelecting: false
  })

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("task-planner-tasks")
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: Task) => ({
        ...task,
        startDate: new Date(task.startDate),
        endDate: new Date(task.endDate),
        // Add default values for new fields if they don't exist
        assignedUser: task.assignedUser || mockUsers[0].name,
        priority: task.priority || "P1",
        color: task.color || "blue"
      }))
      setTasks(parsedTasks)
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("task-planner-tasks", JSON.stringify(tasks))
  }, [tasks])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('mobile-sidebar')
        const filterButton = document.getElementById('filter-button')
        
        if (sidebar && !sidebar.contains(event.target as Node) && 
            filterButton && !filterButton.contains(event.target as Node)) {
          setIsSidebarOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSidebarOpen])

  const createTask = (
    name: string, 
    category: TaskCategory, 
    startDate: Date, 
    endDate: Date,
    assignedUser: string,
    priority: TaskPriority,
    color: TaskColor
  ) => {
    const newTask: Task = {
      id: generateId(),
      name,
      category,
      startDate,
      endDate,
      assignedUser,
      priority,
      color
    }
    setTasks(prev => [...prev, newTask])
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ))
  }

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const handleDragSelection = (startDate: Date, endDate: Date) => {
    setDragSelection({
      startDate,
      endDate,
      isSelecting: false
    })
    setSelectedTask({
      id: "",
      name: "",
      category: "To Do",
      startDate,
      endDate,
      assignedUser: mockUsers[0].name,
      priority: "P1",
      color: "blue"
    })
    setIsModalOpen(true)
  }

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleModalSave = (
    name: string, 
    category: TaskCategory, 
    assignedUser: string, 
    priority: TaskPriority, 
    color: TaskColor
  ) => {
    if (selectedTask) {
      if (selectedTask.id) {
        // Update existing task
        updateTask(selectedTask.id, { name, category, assignedUser, priority, color })
      } else {
        // Create new task
        createTask(name, category, selectedTask.startDate, selectedTask.endDate, assignedUser, priority, color)
      }
    }
    setIsModalOpen(false)
    setSelectedTask(null)
    setDragSelection({ startDate: null, endDate: null, isSelecting: false })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedTask(null)
    setDragSelection({ startDate: null, endDate: null, isSelecting: false })
  }


  return (
    <div className="flex h-screen bg-background relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64">
        <FilterSidebar
          categoryFilters={categoryFilters}
          setCategoryFilters={setCategoryFilters}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          userFilters={userFilters}
          setUserFilters={setUserFilters}
          users={mockUsers}
        />
      </div>

      {/* Mobile Sidebar */}
      <div 
        id="mobile-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:hidden",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <FilterSidebar
          categoryFilters={categoryFilters}
          setCategoryFilters={setCategoryFilters}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          userFilters={userFilters}
          setUserFilters={setUserFilters}
          users={mockUsers}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <Button
              id="filter-button"
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Task Planner</h1>
          </div>
        </div>

        <Calendar
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          tasks={tasks}
          categoryFilters={categoryFilters}
          timeFilter={timeFilter}
          userFilters={userFilters}
          onTaskUpdate={updateTask}
          onTaskEdit={handleTaskEdit}
          onTaskDelete={deleteTask}
          onDragSelection={handleDragSelection}
          dragSelection={dragSelection}
          setDragSelection={setDragSelection}
        />
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDelete={deleteTask}
        task={selectedTask}
        users={mockUsers}
      />
    </div>
  )
}
