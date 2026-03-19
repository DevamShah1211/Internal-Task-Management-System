using TaskManagement.API.Models;

namespace TaskManagement.API.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TaskPriority Priority { get; set; }
        public Models.TaskStatus Status { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        
        public int CreatedById { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        
        public int AssignedToId { get; set; }
        public string AssignedToName { get; set; } = string.Empty;

        public List<CommentDto> Comments { get; set; } = new();
        public List<SubtaskDto> Subtasks { get; set; } = new();
    }

    public class TaskCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TaskPriority Priority { get; set; }
        public Models.TaskStatus Status { get; set; } = Models.TaskStatus.Pending;
        public DateTime DueDate { get; set; }
        public int AssignedToId { get; set; }
    }

    public class CommentDto
    {
        public int Id { get; set; }
        public string Comment { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class SubtaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
    }

    public class SubtaskCreateDto
    {
        public string Title { get; set; } = string.Empty;
    }

    public class NotificationDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
 