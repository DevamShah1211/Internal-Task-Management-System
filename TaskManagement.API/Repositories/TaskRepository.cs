using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.Models;

namespace TaskManagement.API.Repositories
{
    public interface ITaskRepository
    {
        Task<TaskItem?> GetByIdAsync(int id);
        Task<IEnumerable<TaskItem>> GetAllAsync(Models.TaskStatus? status = null, TaskPriority? priority = null, int? assignedToId = null);
        Task AddAsync(TaskItem task);
        Task UpdateAsync(TaskItem task);
        Task DeleteAsync(int id);
        Task AddCommentAsync(TaskComment comment);
        Task AddSubtaskAsync(Subtask subtask);
        Task UpdateSubtaskAsync(Subtask subtask);
        Task<Subtask?> GetSubtaskByIdAsync(int subtaskId);
    }

    public class TaskRepository : ITaskRepository
    {
        private readonly ApplicationDbContext _context;

        public TaskRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TaskItem?> GetByIdAsync(int id)
        {
            return await _context.Tasks
                .Include(t => t.CreatedBy)
                .Include(t => t.AssignedTo)
                .Include(t => t.Comments)
                    .ThenInclude(c => c.User)
                .Include(t => t.Subtasks)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<TaskItem>> GetAllAsync(Models.TaskStatus? status = null, TaskPriority? priority = null, int? assignedToId = null)
        {
            var query = _context.Tasks
                .Include(t => t.CreatedBy)
                .Include(t => t.AssignedTo)
                .AsQueryable();

            if (status.HasValue) query = query.Where(t => t.Status == status.Value);
            if (priority.HasValue) query = query.Where(t => t.Priority == priority.Value);
            if (assignedToId.HasValue) query = query.Where(t => t.AssignedToId == assignedToId.Value);

            return await query.ToListAsync();
        }

        public async Task AddAsync(TaskItem task)
        {
            await _context.Tasks.AddAsync(task);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(TaskItem task)
        {
            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task != null)
            {
                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();
            }
        }

        public async Task AddCommentAsync(TaskComment comment)
        {
            await _context.TaskComments.AddAsync(comment);
            await _context.SaveChangesAsync();
        }

        public async Task AddSubtaskAsync(Subtask subtask)
        {
            await _context.Subtasks.AddAsync(subtask);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateSubtaskAsync(Subtask subtask)
        {
            _context.Subtasks.Update(subtask);
            await _context.SaveChangesAsync();
        }

        public async Task<Subtask?> GetSubtaskByIdAsync(int subtaskId)
        {
            return await _context.Subtasks.FindAsync(subtaskId);
        }
    }
}
 