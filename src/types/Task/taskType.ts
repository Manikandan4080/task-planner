export interface Task {
    id: string
    name: string
    category: TaskCategory
    startDate: Date
    endDate: Date
    assignedUser: string
    priority: TaskPriority
    color: TaskColor
  }
  
  export type TaskCategory = "To Do" | "In Progress" | "Review" | "Completed"
  
  export type TaskPriority = "P0" | "P1" | "P2"
  
  export type TaskColor = "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal"
  
  export type TimeFilter = "all" | "1week" | "2weeks" | "3weeks"
  

  