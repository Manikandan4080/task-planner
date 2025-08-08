

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import type { TaskCategory, TimeFilter } from "@/types/Task/taskType"
import type { User } from "@/types/user/userType"

interface FilterSidebarProps {
  categoryFilters: TaskCategory[]
  setCategoryFilters: (filters: TaskCategory[]) => void
  timeFilter: TimeFilter
  setTimeFilter: (filter: TimeFilter) => void
  userFilters: string[]
  setUserFilters: (filters: string[]) => void
  users: User[]
  onClose?: () => void
}

const allCategories: TaskCategory[] = ["To Do", "In Progress", "Review", "Completed"]
const timeFilterOptions: { value: TimeFilter; label: string }[] = [
  { value: "all", label: "All tasks" },
  { value: "1week", label: "Tasks within 1 week" },
  { value: "2weeks", label: "Tasks within 2 weeks" },
  { value: "3weeks", label: "Tasks within 3 weeks" }
]

export default function FilterSidebar({
  categoryFilters,
  setCategoryFilters,
  timeFilter,
  setTimeFilter,
  userFilters,
  setUserFilters,
  users,
  onClose
}: FilterSidebarProps) {
  const handleCategoryToggle = (category: TaskCategory) => {
    if (categoryFilters.includes(category)) {
      setCategoryFilters(categoryFilters.filter(c => c !== category))
    } else {
      setCategoryFilters([...categoryFilters, category])
    }
  }

  const handleUserToggle = (userName: string) => {
    if (userFilters.includes(userName)) {
      setUserFilters(userFilters.filter(u => u !== userName))
    } else {
      setUserFilters([...userFilters, userName])
    }
  }

  return (
    <div className="w-full h-full bg-background border-r flex flex-col shadow-lg lg:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <h2 className="font-semibold text-lg">Filters</h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Category Filters */}
        <div>
          <h3 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wide">Categories</h3>
          <div className="space-y-3">
            {allCategories.map(category => (
              <div key={category} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={category}
                  checked={categoryFilters.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                  className="h-4 w-4"
                />
                <Label htmlFor={category} className="text-sm font-normal cursor-pointer flex-1">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* User Filters */}
        <div>
          <h3 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wide">Assigned Users</h3>
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={user.id}
                  checked={userFilters.includes(user.name)}
                  onCheckedChange={() => handleUserToggle(user.name)}
                  className="h-4 w-4"
                />
                <Label htmlFor={user.id} className="text-sm font-normal cursor-pointer flex-1">
                  {user.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Time-based Filters */}
        <div>
          <h3 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wide">Time Range</h3>
          <RadioGroup value={timeFilter} onValueChange={setTimeFilter} className="space-y-3">
            {timeFilterOptions.map(option => (
              <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.value} id={option.value} className="h-4 w-4" />
                <Label htmlFor={option.value} className="text-sm font-normal cursor-pointer flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
