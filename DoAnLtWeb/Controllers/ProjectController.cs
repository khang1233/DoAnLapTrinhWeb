using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DoAnLtWeb.Data;
using DoAnLtWeb.Models;
using System.Security.Claims;

namespace DoAnLtWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public IActionResult GetMyProjects()
        {
            var userId = GetUserId();
            var projects = _context.Projects.Where(p => p.UserId == userId).OrderByDescending(p => p.CreatedAt).ToList();
            return Ok(projects);
        }

        [HttpPost]
        public IActionResult CreateProject([FromBody] CreateProjectDto dto)
        {
            var project = new Project { Name = dto.Name, UserId = GetUserId() };
            _context.Projects.Add(project);
            _context.SaveChanges();
            return Ok(project);
        }

        [HttpPut("{id}")]
        public IActionResult SaveProject(int id, [FromBody] SaveProjectDto dto)
        {
            var project = _context.Projects.FirstOrDefault(p => p.Id == id && p.UserId == GetUserId());
            if (project == null) return NotFound(new { message = "Không tìm thấy dự án." });

            project.SlideDataJson = dto.SlideDataJson;
            _context.SaveChanges();
            return Ok(new { message = "Lưu slide thành công." });
        }
        
        [HttpDelete("{id}")]
        public IActionResult DeleteProject(int id)
        {
            var project = _context.Projects.FirstOrDefault(p => p.Id == id && p.UserId == GetUserId());
            if (project == null) return NotFound(new { message = "Không tìm thấy dự án." });

            _context.Projects.Remove(project);
            _context.SaveChanges();
            return Ok(new { message = "Xóa dự án thành công." });
        }
    }

    public class CreateProjectDto { public string Name { get; set; } = string.Empty; }
    public class SaveProjectDto { public string SlideDataJson { get; set; } = string.Empty; }
}
