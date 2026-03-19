export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export enum TaskPriority {
    Low = 0,
    Medium = 1,
    High = 2
}

export enum TaskStatus {
    Pending = 0,
    InProgress = 1,
    Completed = 2
}

export interface TaskComment {
    id: number;
    comment: string;
    userId: number;
    userName: string;
    createdAt: Date;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: Date;
    createdAt: Date;
    createdById: number;
    createdByName: string;
    assignedToId: number;
    assignedToName: string;
    comments: TaskComment[];
    subtasks: Subtask[];
}

export interface Subtask {
    id: number;
    title: string;
    isCompleted: boolean;
}

export interface Notification {
    id: number;
    userId: number;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

export interface DashboardStats {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    tasksByStatus: { status: string, count: number }[];
    tasksByPriority: { priority: string, count: number }[];
}
 