using System.Diagnostics;
using DoAnLtWeb.Data;
using DoAnLtWeb.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Dynamic;

namespace DoAnLtWeb.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly AppDbContext _context;

        public HomeController(ILogger<HomeController> logger, AppDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<IActionResult> Index(string category = null, string search = null)
        {
            // Lấy ID user hiện tại từ Claims
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return RedirectToAction("Login", "Account");

            var myProjectsQuery = _context.Presentations
                .Include(p => p.Slides)
                .Where(p => p.UserId == userId && !p.IsTemplate);

            if (!string.IsNullOrEmpty(search))
            {
                myProjectsQuery = myProjectsQuery.Where(p => p.Title.Contains(search));
            }

            var myProjects = await myProjectsQuery
                .OrderByDescending(p => p.UpdatedAt)
                .ToListAsync();

            var templatesQuery = _context.Presentations.Where(p => p.IsTemplate);
            if (!string.IsNullOrEmpty(category))
            {
                templatesQuery = templatesQuery.Where(p => p.Category == category);
            }
            if (!string.IsNullOrEmpty(search))
            {
                templatesQuery = templatesQuery.Where(p => p.Title.Contains(search));
            }
            var templates = await templatesQuery.OrderByDescending(p => p.CreatedAt).ToListAsync();

            dynamic model = new ExpandoObject();
            model.MyProjects = myProjects;
            model.Templates = templates;
            model.ActiveCategory = category;
            model.SearchQuery = search;

            return View(model);
        }

        [AllowAnonymous]
        public IActionResult Privacy()
        {
            return View();
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
