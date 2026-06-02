using Microsoft.AspNetCore.Mvc;
using DoAnLtWeb.Data;
using DoAnLtWeb.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace DoAnLtWeb.Controllers
{
    [Authorize]
    public class SlideController : Controller
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public SlideController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpPost]
        public async Task<IActionResult> Create()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var presentation = new Presentation
            {
                Title = "Bản thuyết trình chưa có tên",
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            var firstSlide = new Slide { PageNumber = 1, BackgroundColor = "#ffffff", ElementsJson = "[]" };
            presentation.Slides.Add(firstSlide);
            
            _context.Presentations.Add(presentation);
            await _context.SaveChangesAsync();
            
            return RedirectToAction("Edit", new { id = presentation.Id });
        }

        [HttpPost]
        public async Task<IActionResult> CloneTemplate(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var template = await _context.Presentations
                .Include(p => p.Slides)
                .FirstOrDefaultAsync(p => p.Id == id && p.IsTemplate);

            if (template == null) return NotFound();

            var presentation = new Presentation
            {
                Title = template.Title + " (Bản sao)",
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            foreach (var slide in template.Slides.OrderBy(s => s.PageNumber))
            {
                presentation.Slides.Add(new Slide
                {
                    PageNumber = slide.PageNumber,
                    BackgroundColor = slide.BackgroundColor,
                    BackgroundImage = slide.BackgroundImage,
                    ElementsJson = slide.ElementsJson
                });
            }

            _context.Presentations.Add(presentation);
            await _context.SaveChangesAsync();

            return RedirectToAction("Edit", new { id = presentation.Id });
        }

        [HttpGet]
        public async Task<IActionResult> GetTemplates()
        {
            var templates = await _context.Presentations
                .Include(p => p.Slides)
                .Where(p => p.IsTemplate)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Category,
                    p.ThumbnailUrl,
                    Slides = p.Slides.OrderBy(s => s.PageNumber).Select(s => new {
                        s.BackgroundColor,
                        s.ElementsJson
                    }).ToList()
                })
                .ToListAsync();

            return Json(templates);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var presentation = await _context.Presentations
                .Include(p => p.Slides.OrderBy(s => s.PageNumber))
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (presentation == null) return NotFound();

            return View(presentation);
        }

        [HttpPost]
        public async Task<IActionResult> SavePresentation(int id, [FromBody] PresentationSaveDto data)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var presentation = await _context.Presentations
                .Include(p => p.Slides)
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (presentation == null) return NotFound();

            if (!string.IsNullOrEmpty(data.Title))
            {
                presentation.Title = data.Title;
            }

            if (!string.IsNullOrEmpty(data.ThumbnailUrl))
            {
                if (data.ThumbnailUrl.StartsWith("data:image"))
                {
                    try
                    {
                        var base64Data = data.ThumbnailUrl.Split(',')[1];
                        var bytes = Convert.FromBase64String(base64Data);
                        string uploadsFolder = Path.Combine(_env.WebRootPath, "thumbnails");
                        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                        string fileName = $"thumb_{presentation.Id}.jpg";
                        string filePath = Path.Combine(uploadsFolder, fileName);
                        await System.IO.File.WriteAllBytesAsync(filePath, bytes);
                        presentation.ThumbnailUrl = $"/thumbnails/{fileName}";
                    }
                    catch { presentation.ThumbnailUrl = data.ThumbnailUrl; }
                }
                else
                {
                    presentation.ThumbnailUrl = data.ThumbnailUrl;
                }
            }

            _context.Slides.RemoveRange(presentation.Slides);
            
            foreach (var slideDto in data.Slides)
            {
                var newSlide = new Slide
                {
                    PresentationId = presentation.Id,
                    PageNumber = slideDto.PageNumber,
                    BackgroundColor = slideDto.BackgroundColor,
                    BackgroundImage = slideDto.BackgroundImage,
                    ElementsJson = slideDto.ElementsJson
                };
                _context.Slides.Add(newSlide);
            }

            presentation.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        [HttpPost]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Vui lòng chọn ảnh hợp lệ.");

            // Create uploads folder if not exists
            string uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename
            string uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            string fileUrl = "/uploads/" + uniqueFileName;
            return Ok(new { url = fileUrl });
        }

        [HttpPost]
        public async Task<IActionResult> PublishAsTemplate(int id)
        {
            // Kiểm tra quyền Admin
            var isAdmin = User.Identity.Name == "Admin" || User.Identity.Name == "admin" || User.Claims.Any(c => c.Value == "admin@slidify.com");
            if (!isAdmin) return Unauthorized("Chỉ Admin mới có thể đăng Mẫu");

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var presentation = await _context.Presentations
                .Include(p => p.Slides)
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (presentation == null) return NotFound();

            presentation.IsTemplate = true;
            if (string.IsNullOrEmpty(presentation.Category))
            {
                presentation.Category = "Doanh nghiệp"; 
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var presentation = await _context.Presentations
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (presentation == null) return NotFound();

            _context.Presentations.Remove(presentation);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        [HttpPost]
        public async Task<IActionResult> Duplicate(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var presentation = await _context.Presentations
                .Include(p => p.Slides)
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (presentation == null) return NotFound();

            var newPresentation = new Presentation
            {
                Title = presentation.Title + " (Bản sao)",
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                ThumbnailUrl = presentation.ThumbnailUrl,
                IsTemplate = false
            };

            foreach (var slide in presentation.Slides.OrderBy(s => s.PageNumber))
            {
                newPresentation.Slides.Add(new Slide
                {
                    PageNumber = slide.PageNumber,
                    BackgroundColor = slide.BackgroundColor,
                    BackgroundImage = slide.BackgroundImage,
                    ElementsJson = slide.ElementsJson
                });
            }

            _context.Presentations.Add(newPresentation);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        [HttpPost]
        public async Task<IActionResult> CreateFromImport([FromBody] PresentationSaveDto data)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var presentation = new Presentation
            {
                Title = string.IsNullOrEmpty(data.Title) ? "Bản thuyết trình nhập từ PDF" : data.Title,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            int pageNum = 1;
            foreach (var slideDto in data.Slides)
            {
                presentation.Slides.Add(new Slide
                {
                    PageNumber = pageNum++,
                    BackgroundColor = string.IsNullOrEmpty(slideDto.BackgroundColor) ? "#ffffff" : slideDto.BackgroundColor,
                    BackgroundImage = slideDto.BackgroundImage,
                    ElementsJson = string.IsNullOrEmpty(slideDto.ElementsJson) ? "[]" : slideDto.ElementsJson
                });
            }

            _context.Presentations.Add(presentation);
            await _context.SaveChangesAsync();

            return Ok(new { id = presentation.Id });
        }
    }

    public class PresentationSaveDto
    {
        public string Title { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public List<SlideDto> Slides { get; set; } = new();
    }

    public class SlideDto
    {
        public int PageNumber { get; set; }
        public string BackgroundColor { get; set; } = string.Empty;
        public string BackgroundImage { get; set; } = string.Empty;
        public string ElementsJson { get; set; } = string.Empty;
    }
}
