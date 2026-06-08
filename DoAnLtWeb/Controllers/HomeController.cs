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

        public async Task<IActionResult> Index(string? category = null, string? search = null)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return RedirectToAction("Login", "Account");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            var myProjectsQuery = _context.Presentations
                .Include(p => p.Slides)
                .Where(p => p.UserId == userId && !p.IsTemplate && !p.IsTrashed);

            if (!string.IsNullOrEmpty(search))
            {
                myProjectsQuery = myProjectsQuery.Where(p => p.Title.Contains(search));
            }

            var myProjects = await myProjectsQuery
                .OrderByDescending(p => p.UpdatedAt)
                .Take(15)
                .ToListAsync();

            var templatesQuery = _context.Presentations
                .Include(p => p.Slides)
                .Where(p => p.IsTemplate && (p.Category.StartsWith("Slidify /") || p.Category.StartsWith("Slidify Mẫu /")));

            if (!string.IsNullOrEmpty(category))
            {
                templatesQuery = templatesQuery.Where(p => p.Category == category);
            }

            if (!string.IsNullOrEmpty(search))
            {
                templatesQuery = templatesQuery.Where(p => p.Title.Contains(search));
            }

            var templates = (await templatesQuery.ToListAsync())
                .Where(p =>
                    p.Slides.Any() &&
                    !System.Text.RegularExpressions.Regex.IsMatch(p.Title, @"\[\d+") &&
                    !new[] { "China", "CQU", "Telecom", "CMB", "Chongqing" }
                        .Any(kw => p.Title.Contains(kw, StringComparison.OrdinalIgnoreCase)))
                .OrderByDescending(p => p.Category != null && p.Category.StartsWith("Slidify Mẫu /"))
                .ThenByDescending(p => p.CreatedAt)
                .ToList();

            dynamic model = new ExpandoObject();
            model.MyProjects = myProjects;
            model.Templates = templates;
            model.ActiveCategory = category;
            model.SearchQuery = search;
            model.IsVip = user != null && user.IsVip && (!user.VipExpiresAt.HasValue || user.VipExpiresAt > DateTime.UtcNow);
            model.VipPlanName = user?.VipPlanName ?? "Free";
            model.VipExpiresAt = user?.VipExpiresAt;

            return View(model);
        }

        [AllowAnonymous]
        public IActionResult Privacy()
        {
            return View();
        }

        public async Task<IActionResult> Shared()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return RedirectToAction("Login", "Account");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            // Decks where I'm a member through a share link, plus decks I own AND have shared with others.
            var sharedToMe = await (from m in _context.PresentationShareMembers
                                    join s in _context.PresentationShares on m.ShareId equals s.Id
                                    join p in _context.Presentations.Include(p => p.Slides) on s.PresentationId equals p.Id
                                    where m.UserId == userId && s.IsActive
                                    select new { p, role = m.Permission.ToString(), owner = s.OwnerUser }).ToListAsync();

            var sharedByMe = await (from s in _context.PresentationShares
                                    join p in _context.Presentations.Include(p => p.Slides) on s.PresentationId equals p.Id
                                    where s.OwnerUserId == userId && s.IsActive
                                    select new { p, role = "Owner", owner = (User?)null }).ToListAsync();

            dynamic model = new System.Dynamic.ExpandoObject();
            model.SharedToMe = sharedToMe;
            model.SharedByMe = sharedByMe;
            model.IsVip = user != null && user.IsVip && (!user.VipExpiresAt.HasValue || user.VipExpiresAt > DateTime.UtcNow);
            return View(model);
        }

        public async Task<IActionResult> Trash()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return RedirectToAction("Login", "Account");

            // Auto-purge entries that have been in the trash longer than 30 days.
            var cutoff = DateTime.UtcNow.AddDays(-30);
            var expired = await _context.Presentations
                .Where(p => p.UserId == userId && p.IsTrashed && p.TrashedAt != null && p.TrashedAt < cutoff)
                .ToListAsync();
            if (expired.Any())
            {
                _context.Presentations.RemoveRange(expired);
                await _context.SaveChangesAsync();
            }

            var trashed = await _context.Presentations
                .Include(p => p.Slides)
                .Where(p => p.UserId == userId && p.IsTrashed && !p.IsTemplate)
                .OrderByDescending(p => p.TrashedAt)
                .ToListAsync();
            return View(trashed);
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
