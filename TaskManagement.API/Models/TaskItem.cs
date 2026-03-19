using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagement.API.Models
{
    public enum TaskPriority
    {
        Low,
        Medium,
        High
    }

    public enum TaskStatus
    {
        Pending,
        InProgress,
        Completed
    }

    public class TaskItem
    {
        public int Id { get; set; }
        [Required]
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        public TaskStatus Status { get; set; } = TaskStatus.Pending;
        
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CreatedById { get; set; }
        [ForeignKey("CreatedById")]
        public User CreatedBy { get; set; } = null!;

        public int AssignedToId { get; set; }
        [ForeignKey("AssignedToId")]
        public User AssignedTo { get; set; } = null!;

        public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
        public ICollection<Subtask> Subtasks { get; set; } = new List<Subtask>();
    }

    public class Subtask
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        [Required]
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        
        [ForeignKey("TaskId")]
        public TaskItem Task { get; set; } = null!;
    }

    public class TaskComment
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public string Comment { get; set; } = string.Empty;
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("TaskId")]
        public TaskItem Task { get; set; } = null!;
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }

    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}
 