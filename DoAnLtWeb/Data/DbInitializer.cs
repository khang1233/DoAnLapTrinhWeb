using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using DoAnLtWeb.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DoAnLtWeb.Data
{
    public static class DbInitializer
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using (var context = new AppDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<AppDbContext>>()))
            {
                context.Database.Migrate();

                var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
                var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();

                SeedRolesAndTestUsers(context, userManager, roleManager);

                var adminUser = userManager.FindByEmailAsync("admin@gmail.com").GetAwaiter().GetResult()
                                 ?? throw new Exception("Admin seed missing.");

                var env = serviceProvider.GetRequiredService<IWebHostEnvironment>();
                SeedExampleDeckTemplates(context, adminUser.Id, env.WebRootPath);
            }
        }

        private static void SeedRolesAndTestUsers(AppDbContext context, UserManager<User> userManager,
            RoleManager<IdentityRole<int>> roleManager)
        {
            foreach (var role in new[] { "Admin", "Vip", "User" })
            {
                if (!roleManager.RoleExistsAsync(role).GetAwaiter().GetResult())
                {
                    roleManager.CreateAsync(new IdentityRole<int>(role)).GetAwaiter().GetResult();
                }
            }

            // Wipe all non-admin presentations/slides + every user that is not one of our 3 seeded ones,
            // so the gallery is clean when the gốc dev resets. Templates owned by admin are kept.
            const string adminEmail = "admin@gmail.com";
            const string vipEmail = "vip@gmail.com";
            const string userEmail = "user@gmail.com";
            var keepEmails = new[] { adminEmail, vipEmail, userEmail };

            // Drop any pre-existing user that's not one of the three. Their non-template presentations
            // (and Identity rows) cascade via FK; payment transactions also cascade.
            var staleUsers = context.Users.Where(u => !keepEmails.Contains(u.Email!)).ToList();
            if (staleUsers.Any())
            {
                foreach (var u in staleUsers)
                {
                    var ownedNonTemplates = context.Presentations.Where(p => p.UserId == u.Id && !p.IsTemplate).ToList();
                    context.Presentations.RemoveRange(ownedNonTemplates);
                }
                context.SaveChanges();
                foreach (var u in staleUsers)
                {
                    userManager.DeleteAsync(u).GetAwaiter().GetResult();
                }
            }

            // (Email, Password, Role, IsVip, PlanName, VipExpiresAt)
            var seeds = new (string Email, string Pass, string Role, bool IsVip, string Plan, DateTime? Expires)[]
            {
                (adminEmail, "123", "Admin", true, "Admin", null),
                (vipEmail, "123", "Vip", true, "VIP Monthly", DateTime.UtcNow.AddYears(1)),
                (userEmail, "123", "User", false, "Free", null),
            };

            foreach (var s in seeds)
            {
                // Always go through UserManager so we don't double-track entities — querying via
                // `context.Users.First(...)` returns a separate instance from the one UserManager
                // tracks, and the next AddToRoleAsync call throws "instance ... is already being tracked".
                var u = userManager.FindByEmailAsync(s.Email).GetAwaiter().GetResult();
                if (u == null)
                {
                    u = new User
                    {
                        UserName = s.Email,
                        Email = s.Email,
                        EmailConfirmed = true,
                        IsVip = s.IsVip,
                        VipPlanName = s.Plan,
                        VipExpiresAt = s.Expires
                    };
                    var res = userManager.CreateAsync(u, s.Pass).GetAwaiter().GetResult();
                    if (!res.Succeeded)
                    {
                        var err = string.Join(", ", res.Errors.Select(e => e.Description));
                        throw new Exception($"Không thể tạo {s.Email}: {err}");
                    }
                }
                else
                {
                    // Make sure fields stay in sync if the seed values are edited later.
                    u.IsVip = s.IsVip;
                    u.VipPlanName = s.Plan;
                    u.VipExpiresAt = s.Expires;
                    userManager.UpdateAsync(u).GetAwaiter().GetResult();
                }
                if (!userManager.IsInRoleAsync(u, s.Role).GetAwaiter().GetResult())
                {
                    userManager.AddToRoleAsync(u, s.Role).GetAwaiter().GetResult();
                }
            }
        }

        private static void SeedExampleDeckTemplates(AppDbContext context, int adminUserId, string webRootPath)
        {
            SeedRichEditableTemplates(context, adminUserId);

            // Skip seeding if the DB is already seeded with rich templates to speed up boot times and preserve updates
            if (context.Presentations.Any(p => p.IsTemplate && p.Slides.Any(s => s.ElementsJson != "[]" && s.ElementsJson != "")
                                               && !p.Category.StartsWith("Slidify Mẫu /")))
            {
                return;
            }

            var editableJsonPath = Path.Combine(webRootPath, "generated-templates-editable.json");
            if (File.Exists(editableJsonPath))
            {
                try
                {
                    var existing = context.Presentations
                        .Include(p => p.Slides)
                        .Where(p => p.IsTemplate && p.Category.StartsWith("Slidify /"))
                        .ToList();
                    context.Presentations.RemoveRange(existing);
                    context.SaveChanges();

                    var jsonText = File.ReadAllText(editableJsonPath);
                    var importDto = System.Text.Json.JsonSerializer.Deserialize<DoAnLtWeb.Controllers.TemplateImportDto>(jsonText, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    if (importDto != null && importDto.Templates != null)
                    {
                        foreach (var tplDto in importDto.Templates)
                        {
                            var presentation = new Presentation
                            {
                                Title = tplDto.Title,
                                UserId = adminUserId,
                                IsTemplate = true,
                                IsPremiumTemplate = tplDto.Slides.Count > 10 || tplDto.Category.Contains("Premium", StringComparison.OrdinalIgnoreCase),
                                PremiumReason = tplDto.Slides.Count > 10 ? "Mẫu slide dài trên 10 trang." : string.Empty,
                                Category = tplDto.Category,
                                ThumbnailUrl = tplDto.ThumbnailUrl,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow,
                            };

                            foreach (var slideDto in tplDto.Slides)
                            {
                                presentation.Slides.Add(new Slide
                                {
                                    PageNumber = slideDto.PageNumber,
                                    BackgroundColor = string.IsNullOrEmpty(slideDto.BackgroundColor) ? "#ffffff" : slideDto.BackgroundColor,
                                    BackgroundImage = slideDto.BackgroundImage,
                                    ElementsJson = string.IsNullOrEmpty(slideDto.ElementsJson) ? "[]" : slideDto.ElementsJson
                                });
                            }

                            context.Presentations.Add(presentation);
                        }
                        context.SaveChanges();
                        return; // Successfully seeded from rich JSON template configuration
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error seeding from generated-templates-editable.json: " + ex.Message);
                }
            }

            var examplesRoot = Path.Combine(webRootPath, "examples");
            if (!Directory.Exists(examplesRoot)) return;

            var existingStatic = context.Presentations
                .Include(p => p.Slides)
                .Where(p => p.IsTemplate && p.Category.StartsWith("Slidify /"))
                .ToList();
            context.Presentations.RemoveRange(existingStatic);
            context.SaveChanges();

            var skippedFolders = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "ppt169_cangzhuo" // has China text; keep it out of the Vietnamese template gallery.
            };

            foreach (var dir in Directory.GetDirectories(examplesRoot).OrderBy(d => d))
            {
                var folder = Path.GetFileName(dir);
                if (skippedFolders.Contains(folder)) continue;

                var slideDir = Directory.Exists(Path.Combine(dir, "svg_final"))
                    ? Path.Combine(dir, "svg_final")
                    : Directory.Exists(Path.Combine(dir, "svg_output"))
                        ? Path.Combine(dir, "svg_output")
                        : string.Empty;
                if (string.IsNullOrEmpty(slideDir)) continue;

                var slides = Directory.GetFiles(slideDir, "*.svg")
                    .OrderBy(f => f, StringComparer.OrdinalIgnoreCase)
                    .ToList();
                if (slides.Count < 2) continue;

                var title = ToDisplayTitle(folder);
                var category = InferCategory(folder);
                var presentation = new Presentation
                {
                    Title = title,
                    UserId = adminUserId,
                    IsTemplate = true,
                    IsPremiumTemplate = slides.Count > 10,
                    PremiumReason = slides.Count > 10 ? "Bộ mẫu dài trên 10 slide." : string.Empty,
                    Category = category,
                    ThumbnailUrl = ToWebPath(webRootPath, slides[0]),
                    CreatedAt = DateTime.UtcNow.AddMinutes(-slides.Count),
                    UpdatedAt = DateTime.UtcNow
                };

                var page = 1;
                foreach (var slidePath in slides)
                {
                    presentation.Slides.Add(new Slide
                    {
                        PageNumber = page++,
                        BackgroundColor = "#ffffff",
                        BackgroundImage = ToWebPath(webRootPath, slidePath),
                        ElementsJson = "[]"
                    });
                }
                context.Presentations.Add(presentation);
            }

            context.SaveChanges();
        }

        private static void SeedRichEditableTemplates(AppDbContext context, int adminUserId)
        {
            const string prefix = "Slidify Mẫu /";
            var existing = context.Presentations
                .Include(p => p.Slides)
                .Where(p => p.IsTemplate && p.Category.StartsWith(prefix))
                .ToList();
            if (existing.Any())
            {
                context.Presentations.RemoveRange(existing);
                context.SaveChanges();
            }

            foreach (var deck in RichTemplateSeeder.BuildTemplates(adminUserId))
            {
                context.Presentations.Add(deck);
            }
            context.SaveChanges();
        }

        private static string ToWebPath(string webRootPath, string filePath)
        {
            var relative = Path.GetRelativePath(webRootPath, filePath).Replace('\\', '/');
            return "/" + relative;
        }

        private static string ToDisplayTitle(string folder)
        {
            var raw = folder.StartsWith("ppt169_", StringComparison.OrdinalIgnoreCase) ? folder[7..] : folder;
            var words = raw.Split('_', StringSplitOptions.RemoveEmptyEntries)
                .Where(w => !string.Equals(w, "ppt", StringComparison.OrdinalIgnoreCase))
                .Select(w => w.Length <= 3 && w.All(char.IsUpper) ? w : char.ToUpperInvariant(w[0]) + w[1..]);
            return string.Join(' ', words);
        }

        private static string InferCategory(string folder)
        {
            var f = folder.ToLowerInvariant();
            if (f.Contains("business") || f.Contains("pitch") || f.Contains("loyalty") || f.Contains("capital")) return "Slidify / Kinh doanh";
            if (f.Contains("ai") || f.Contains("kubernetes") || f.Contains("tech") || f.Contains("agents") || f.Contains("claude")) return "Slidify / Công nghệ";
            if (f.Contains("travel") || f.Contains("du_lich") || f.Contains("viet_nam")) return "Slidify / Du lịch";
            if (f.Contains("fashion") || f.Contains("lookbook")) return "Slidify / Thời trang";
            if (f.Contains("food") || f.Contains("sugar") || f.Contains("menu")) return "Slidify / Menu";
            if (f.Contains("education") || f.Contains("research") || f.Contains("tac_gia") || f.Contains("attention")) return "Slidify / Giáo dục";
            if (f.Contains("architect") || f.Contains("home_design") || f.Contains("rise") || f.Contains("pritzker")) return "Slidify / Kiến trúc";
            if (f.Contains("movie") || f.Contains("phim") || f.Contains("moodboard")) return "Slidify / Điện ảnh";
            if (f.Contains("zine") || f.Contains("bookstore") || f.Contains("culture") || f.Contains("van_hoa")) return "Slidify / Văn hóa";
            return "Slidify / Đa dụng";
        }
    }
}
