using AutoMapper;
using TaskManagement.API.DTOs;
using TaskManagement.API.Models;

namespace TaskManagement.API.Services
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDto>();
            
            CreateMap<TaskItem, TaskDto>()
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedBy.Name))
                .ForMember(dest => dest.AssignedToName, opt => opt.MapFrom(src => src.AssignedTo.Name));

            CreateMap<TaskCreateDto, TaskItem>();
            
            CreateMap<TaskComment, CommentDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Name));

            CreateMap<Subtask, SubtaskDto>();
            CreateMap<SubtaskCreateDto, Subtask>();
            
            CreateMap<Notification, NotificationDto>();
            
            CreateMap<UserCreateDto, User>();
            CreateMap<UserUpdateDto, User>();
        }
    }
}
 