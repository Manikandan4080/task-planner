import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Task, TaskCategory, TaskColor, TaskPriority } from "@/types/Task/taskType"
import type { User } from "@/types/user/userType"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, category: TaskCategory, assignedUser: string, priority: TaskPriority, color: TaskColor) => void
  onDelete?: (taskId: string) => void
  task: Task | null
  users: User[]
}

const categories: TaskCategory[] = ["To Do", "In Progress", "Review", "Completed"]
const priorities: TaskPriority[] = ["P0", "P1", "P2"]
const colors: TaskColor[] = ["blue", "green", "purple", "orange", "red", "pink", "indigo", "teal"]

const priorityLabels = {
  "P0": "Critical",
  "P1": "High", 
  "P2": "Medium"
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

export default function TaskModal({ isOpen, onClose, onSave, onDelete, task, users }: TaskModalProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState<TaskCategory>("To Do")
  const [assignedUser, setAssignedUser] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("P1")
  const [color, setColor] = useState<TaskColor>("blue")

  useEffect(() => {
    if (task) {
      setName(task.name)
      setCategory(task.category)
      setAssignedUser(task.assignedUser)
      setPriority(task.priority)
      setColor(task.color)
    } else {
      setName("")
      setCategory("To Do")
      setAssignedUser(users[0]?.name || "")
      setPriority("P1")
      setColor("blue")
    }
  }, [task, users])

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), category, assignedUser, priority, color)
      resetForm()
    }
  }

  const handleDelete = () => {
    if (task?.id && onDelete) {
      onDelete(task.id)
      onClose()
      resetForm()
    }
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setCategory("To Do")
    setAssignedUser(users[0]?.name || "")
    setPriority("P1")
    setColor("blue")
  }

  const isEditMode = task?.id

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-lg">
            <span>{isEditMode ? "Edit Task" : "Create New Task"}</span>
            {isEditMode && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{task?.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-name" className="text-sm font-medium">Task Name</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task name..."
              autoFocus
              className="h-11"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-category" className="text-sm font-medium">Category</Label>
            <Select value={category} onValueChange={(value: TaskCategory) => setCategory(value)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned-user" className="text-sm font-medium">Assigned User</Label>
            <Select value={assignedUser} onValueChange={setAssignedUser}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.name}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
            <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(p => (
                  <SelectItem key={p} value={p}>
                    <div className="flex items-center gap-2">
                      <Badge className={`${priorityColors[p]} text-white rounded-full text-xs`}>
                        {p}
                      </Badge>
                      {priorityLabels[p]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Color</Label>
            <div className="flex flex-wrap gap-3 p-2">
              {colors.map(c => (
                <button
                  key={c}
                  className={`w-10 h-10 rounded-full ${taskColors[c]} border-3 ${
                    color === c ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'
                  } hover:scale-110 transition-all duration-200 shadow-sm`}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {isEditMode && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg space-y-1">
              <div className="font-medium mb-2">Task Details:</div>
              <div>Created: {task?.startDate && new Date(task.startDate).toLocaleDateString()}</div>
              <div>Duration: {task?.startDate && task?.endDate && 
                Math.ceil((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1)} days
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto h-11">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="w-full sm:w-auto h-11">
            {isEditMode ? "Update Task" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
