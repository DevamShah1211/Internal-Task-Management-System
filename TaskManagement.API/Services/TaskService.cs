using AutoMapper;
using TaskManagement.API.DTOs;
using TaskManagement.API.Models;
using TaskManagement.API.Repositories;

namespace TaskManagement.API.Services
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskDto>> GetAllTasksAsync(Models.TaskStatus? status = null, TaskPriority? priority = null, int? assignedToId = null, int? currentUserId = null, string? role = null);
        Task<TaskDto?> GetTaskByIdAsync(int id, int? currentUserId = null, string? role = null);
        Task<TaskDto> CreateTaskAsync(TaskCreateDto taskDto, int creatorId);
        Task<bool> UpdateTaskAsync(int id, TaskCreateDto taskDto, int? currentUserId = null, string? role = null);
        Task<bool> DeleteTaskAsync(int id, int? currentUserId = null, string? role = null);
        Task<CommentDto> AddCommentAsync(int taskId, string comment, int userId);
        Task<bool> UpdateTaskStatusAsync(int id, Models.TaskStatus newStatus, int userId);
        Task<SubtaskDto> AddSubtaskAsync(int taskId, string title, int currentUserId, string role);
        Task<bool> ToggleSubtaskAsync(int subtaskId, bool isCompleted);
        Task<object> GetDashboardStatsAsync(int? currentUserId = null, string? role = null);
    }

    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly IMapper _mapper;

        public TaskService(ITaskRepository taskRepository, IUserRepository userRepository, INotificationRepository notificationRepository, IMapper mapper)
        {
            _taskRepository = taskRepository;
            _userRepository = userRepository;
            _notificationRepository = notificationRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TaskDto>> GetAllTasksAsync(Models.TaskStatus? status = null, TaskPriority? priority = null, int? assignedToId = null, int? currentUserId = null, string? role = null)
        {
            var tasks = await _taskRepository.GetAllAsync(status, priority, assignedToId);
            
            if (role != "Admin" && currentUserId.HasValue)
            {
                tasks = tasks.Where(t => t.AssignedToId == currentUserId || t.CreatedById == currentUserId);
            }

            return _mapper.Map<IEnumerable<TaskDto>>(tasks);
        }

        public async Task<TaskDto?> GetTaskByIdAsync(int id, int? currentUserId = null, string? role = null)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task == null) return null;

            if (role != "Admin" && currentUserId.HasValue)
            {
                if (task.AssignedToId != currentUserId && task.CreatedById != currentUserId)
                    return null;
            }

            return _mapper.Map<TaskDto>(task);
        }

        public async Task<TaskDto> CreateTaskAsync(TaskCreateDto taskDto, int creatorId)
        {
            var task = _mapper.Map<TaskItem>(taskDto);
            task.CreatedById = creatorId;
            await _taskRepository.AddAsync(task);
            
            // Notify Assigned user
            if (task.AssignedToId != creatorId)
            {
                var creator = await _userRepository.GetByIdAsync(creatorId);
                await _notificationRepository.AddAsync(new Notification
                {
                    UserId = task.AssignedToId,
                    Message = $"{creator?.Name} assigned you a new task: '{task.Title}'"
                });
            }

            return await GetTaskByIdAsync(task.Id) ?? _mapper.Map<TaskDto>(task);
        }

        public async Task<bool> UpdateTaskAsync(int id, TaskCreateDto taskDto, int? currentUserId = null, string? role = null)
        {
            var existing = await _taskRepository.GetByIdAsync(id);
            if (existing == null) return false;

            if (role != "Admin" && currentUserId.HasValue)
            {
                if (existing.CreatedById != currentUserId)
                    throw new UnauthorizedAccessException("Only the creator or Admin can edit the task.");
            }

            _mapper.Map(taskDto, existing);
            await _taskRepository.UpdateAsync(existing);
            return true;
        }

        public async Task<bool> DeleteTaskAsync(int id, int? currentUserId = null, string? role = null)
        {
            var existing = await _taskRepository.GetByIdAsync(id);
            if (existing == null) return false;

            if (role != "Admin" && currentUserId.HasValue)
            {
                if (existing.CreatedById != currentUserId)
                    throw new UnauthorizedAccessException("Only the creator or Admin can delete the task.");
            }

            await _taskRepository.DeleteAsync(id);
            return true;
        }

        public async Task<CommentDto> AddCommentAsync(int taskId, string commentStr, int userId)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            
            var comment = new TaskComment
            {
                TaskId = taskId,
                Comment = commentStr,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            await _taskRepository.AddCommentAsync(comment);
            
            var user = await _userRepository.GetByIdAsync(userId);
            
            // Notify other user
            var targetUserId = task?.CreatedById == userId ? task?.AssignedToId : task?.CreatedById;
            if (targetUserId.HasValue)
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    UserId = targetUserId.Value,
                    Message = $"New comment on task '{task?.Title}' by {user?.Name}."
                });
            }

            return new CommentDto
            {
                Id = comment.Id,
                Comment = comment.Comment,
                UserId = userId,
                UserName = user?.Name ?? "Unknown",
                CreatedAt = comment.CreatedAt
            };
        }

        public async Task<bool> UpdateTaskStatusAsync(int id, Models.TaskStatus newStatus, int userId)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task == null) return false;

            task.Status = newStatus;
            await _taskRepository.UpdateAsync(task);

            var currentUser = await _userRepository.GetByIdAsync(userId);

            if (newStatus == Models.TaskStatus.InProgress)
            {
                await _notificationRepository.AddAsync(new Notification { UserId = task.CreatedById, Message = $"{currentUser?.Name} is now working on task '{task.Title}'." });
            }
            else if (newStatus == Models.TaskStatus.Completed)
            {
                await _notificationRepository.AddAsync(new Notification { UserId = task.CreatedById, Message = $"{currentUser?.Name} completed task '{task.Title}'!" });
            }

            return true;
        }

        public async Task<SubtaskDto> AddSubtaskAsync(int taskId, string title, int currentUserId, string role)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null) throw new KeyNotFoundException("Task not found");

            if (role != "Admin" && task.CreatedById != currentUserId)
                throw new UnauthorizedAccessException("Only the creator or Admin can add subtasks.");

            var subtask = new Subtask { TaskId = taskId, Title = title };
            await _taskRepository.AddSubtaskAsync(subtask);
            return _mapper.Map<SubtaskDto>(subtask);
        }

        public async Task<bool> ToggleSubtaskAsync(int subtaskId, bool isCompleted)
        {
            var subtask = await _taskRepository.GetSubtaskByIdAsync(subtaskId);
            if (subtask == null) return false;
            
            subtask.IsCompleted = isCompleted;
            await _taskRepository.UpdateSubtaskAsync(subtask);
            return true;
        }

        public async Task<object> GetDashboardStatsAsync(int? currentUserId = null, string? role = null)
        {
            var tasks = await _taskRepository.GetAllAsync();
            
            if (role != "Admin" && currentUserId.HasValue)
            {
                tasks = tasks.Where(t => t.AssignedToId == currentUserId || t.CreatedById == currentUserId);
            }

            var taskList = tasks.ToList();

            return new
            {
                TotalTasks = taskList.Count,
                CompletedTasks = taskList.Count(t => t.Status == Models.TaskStatus.Completed),
                PendingTasks = taskList.Count(t => t.Status == Models.TaskStatus.Pending),
                InProgressTasks = taskList.Count(t => t.Status == Models.TaskStatus.InProgress),
                OverdueTasks = taskList.Count(t => t.Status != Models.TaskStatus.Completed && t.DueDate < DateTime.UtcNow),
                TasksByStatus = taskList.GroupBy(t => t.Status).Select(g => new { Status = g.Key.ToString(), Count = g.Count() }),
                TasksByPriority = taskList.GroupBy(t => t.Priority).Select(g => new { Priority = g.Key.ToString(), Count = g.Count() })
            };
        }
    }
}
 