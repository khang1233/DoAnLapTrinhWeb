using System;
using System.Linq;
using DoAnLtWeb.Models;
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
                // Delete existing templates to force reseed for the new designs
                var oldTemplates = context.Presentations.Where(p => p.IsTemplate);
                context.Presentations.RemoveRange(oldTemplates);
                context.SaveChanges();

                // Create a system user for templates if doesn't exist
                var adminUser = context.Users.FirstOrDefault(u => u.Email == "admin@slidify.com");
                if (adminUser == null)
                {
                    adminUser = new User
                    {
                        Username = "System Admin",
                        Email = "admin@slidify.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123")
                    };
                    context.Users.Add(adminUser);
                    context.SaveChanges();
                }

                // Helper to create a multi-page template
                void CreateTemplate(string title, string category, List<(string BgColor, string Json)> pages, string thumbnailBase64 = "")
                {
                    var presentation = new Presentation
                    {
                        Title = title,
                        UserId = adminUser.Id,
                        IsTemplate = true,
                        Category = category,
                        ThumbnailUrl = thumbnailBase64,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    int pageNum = 1;
                    foreach (var p in pages)
                    {
                        presentation.Slides.Add(new Slide
                        {
                            PageNumber = pageNum++,
                            BackgroundColor = p.BgColor,
                            ElementsJson = p.Json
                        });
                    }

                    context.Presentations.Add(presentation);
                }

                var categories = new[] { "Doanh nghiệp", "Giáo dục", "Công nghệ", "Sáng tạo" };
                var random = new Random();

                for (int i = 1; i <= 150; i++)
                {
                    string category = categories[random.Next(categories.Length)];
                    string title = "";
                    string json = "";
                    string bgColor = "";

                    var pages = new System.Collections.Generic.List<(string BgColor, string Json)>();

                    if (category == "Doanh nghiệp")
                    {
                        title = $"Kế Hoạch Doanh Nghiệp {random.Next(1, 5)} - 2026 [{i}]";
                        // Page 1: Cover
                        pages.Add(("#1e3a8a", $@"{{""version"":""5.3.0"",""objects"":[{{""type"":""image"",""src"":""https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&h=450&auto=format&fit=crop"",""left"":400,""top"":0,""width"":400,""height"":450,""crossOrigin"":""anonymous""}},{{""type"":""rect"",""left"":0,""top"":0,""width"":400,""height"":450,""fill"":""#1e3a8a"",""selectable"":false}},{{""type"":""i-text"",""text"":""{title.ToUpper()}"",""left"":30,""top"":150,""fontSize"":32,""fill"":""#ffffff"",""fontFamily"":""Inter"",""fontWeight"":""bold""}},{{""type"":""rect"",""left"":30,""top"":250,""width"":100,""height"":4,""fill"":""#f97316""}},{{""type"":""i-text"",""text"":""Báo cáo chiến lược quý"",""left"":30,""top"":270,""fontSize"":18,""fill"":""#94a3b8"",""fontFamily"":""Inter""}}]}}"));
                        // Page 2: Table of Contents
                        pages.Add(("#ffffff", $@"{{""version"":""5.3.0"",""objects"":[{{""type"":""rect"",""left"":0,""top"":0,""width"":800,""height"":450,""fill"":""#ffffff"",""selectable"":false}},{{""type"":""i-text"",""text"":""NỘI DUNG CHÍNH"",""left"":50,""top"":50,""fontSize"":28,""fill"":""#1e3a8a"",""fontFamily"":""Inter"",""fontWeight"":""bold""}},{{""type"":""i-text"",""text"":""01. Tổng quan thị trường\n02. Phân tích đối thủ\n03. Chiến lược sản phẩm\n04. Dự phóng tài chính"",""left"":50,""top"":120,""fontSize"":20,""fill"":""#475569"",""fontFamily"":""Inter"",""lineHeight"":2}},{{""type"":""triangle"",""left"":600,""top"":300,""width"":150,""height"":150,""fill"":""#f8fafc""}}]}}"));
                        // Page 3: Overview
                        pages.Add(("#f8fafc", $@"{{""version"":""5.3.0"",""objects"":[{{""type"":""rect"",""left"":0,""top"":0,""width"":800,""height"":450,""fill"":""#f8fafc"",""selectable"":false}},{{""type"":""rect"",""left"":0,""top"":0,""width"":50,""height"":450,""fill"":""#1e3a8a""}},{{""type"":""i-text"",""text"":""01. TỔNG QUAN"",""left"":80,""top"":50,""fontSize"":28,""fill"":""#f97316"",""fontFamily"":""Inter"",""fontWeight"":""bold""}},{{""type"":""i-text"",""text"":""Doanh thu tăng trưởng mạnh mẽ trong quý vừa qua nhờ vào\nsự mở rộng kênh phân phối trực tuyến..."",""left"":80,""top"":150,""fontSize"":18,""fill"":""#334155"",""fontFamily"":""Inter"",""lineHeight"":1.5}}]}}"));
                    }
                    else if (category == "Giáo dục")
                    {
                        title = $"Giáo Án: Khám Phá Vũ Trụ [{i}]";
                        // Page 1: Cover
                        pages.Add(("#166534", $@"{{""version"":""5.3.0"",""objects"":[{{""type"":""image"",""src"":""https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&h=450&auto=format&fit=crop"",""left"":0,""top"":0,""width"":800,""height"":450,""crossOrigin"":""anonymous"",""opacity"":0.5}},{{""type"":""rect"",""left"":0,""top"":0,""width"":800,""height"":450,""fill"":""#166534"",""opacity"":0.8,""selectable"":false}},{{""type"":""i-text"",""text"":""{title.ToUpper()}"",""left"":100,""top"":150,""fontSize"":42,""fill"":""#fcd34d"",""fontFamily"":""Inter"",""fontWeight"":""bold""}},{{""type"":""i-text"",""text"":""Giảng viên: Nguyễn Văn A"",""left"":100,""top"":250,""fontSize"":22,""fill"":""#ffffff"",""fontFamily"":""Inter""}}]}}"));
                        // Page 2: Intro
                        pages.Add(("#ffffff", $@"{{""version"":""5.3.0"",""objects"":[{{""type"":""rect"",""left"":0,""top"":0,""width"":800,""height"":450,""fill"":""#ffffff"",""selectable"":false}},{{""type"":""circle"",""left"":600,""top"":-50,""radius"":150,""fill"":""#fef08a"",""opacity"":0.5}},{{""type"":""i-text"",""text"":""HỆ MẶT TRỜI CỦA CHÚNG TA"",""left"":80,""top"":80,""fontSize"":28,""fill"":""#166534"",""fontFamily"":""Inter"",""fontWeight"":""bold""}},{{""type"":""i-text"",""text"":""Hệ Mặt Trời bao gồm ngôi sao ở trung tâm là Mặt Trời\nvà các thiên thể quay xung quanh nó..."",""left"":80,""top"":180,""fontSize"":20,""fill"":""#475569"",""fontFamily"":""Inter"",""lineHeight"":1.6}}]}}"));
                        // Page 3: Planets
                        pages.Add(("#fef08a", $@"{{""version"":""5.3.0"",""objects"":[{{""type"":""rect"",""left"":0,""top"":0,""width"":800,""height"":450,""fill"":""#fef08a"",""selectable"":false}},{{""type"":""i-text"",""text"":""8 HÀNH TINH CHÍNH"",""left"":80,""top"":80,""fontSize"":32,""fill"":""#b45309"",""fontFamily"":""Inter"",""fontWeight"":""bold""}},{{""type"":""rect"",""left"":80,""top"":150,""width"":150,""height"":150,""fill"":""#166534""}},{{""type"":""rect"",""left"":250,""top"":150,""width"":150,""height"":150,""fill"":""#166534""}},{{""type"":""rect"",""left"":420,""top"":150,""width"":150,""height"":150,""fill"":""#166534""}}]}}"));
                    }
                    else if (category == "Công nghệ")
                    {
                        title = $"Báo cáo AI Project [{i}]";
                        // Page 1: Cover
                        pages.Add(("#000000", $@"{{""version"":""5.3.0"",""objects"":[{{""type"":""image"",""src"":""https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&h=450&auto=format&fit=crop"",""left"":0,""top"":0,""width"":800,""height"":450,""opacity"":0.3,""crossOrigin"":""anonymous""}},{{""type"":""circle"",""left"":400,""top"":200,""radius"":100,""fill"":""#c026d3"",""opacity"":0.4}},{{""type"":""i-text"",""text"":""{title.ToUpper()}"",""left"":150,""top"":180,""fontSize"":45,""fill"":""#06b6d4"",""fontFamily"":""Inter"",""fontWeight"":""bold""}},{{""type"":""rect"",""left"":150,""top"":280,""width"":200,""height"":3,""fill"":""#c026d3""}}]}}"));
                        // Page 2: Architecture
                        pages.Add(("#111827", $@"{{""version"":""5.3.0"",""objects"":[{{""type"":""rect"",""left"":0,""top"":0,""width"":800,""height"":450,""fill"":""#111827"",""selectable"":false}},{{""type"":""i-text"",""text"":""KIẾN TRÚC HỆ THỐNG"",""left"":50,""top"":50,""fontSize"":30,""fill"":""#e879f9"",""fontFamily"":""Inter"",""fontWeight"":""bold""}},{{""type"":""rect"",""left"":50,""top"":150,""width"":200,""height"":100,""fill"":""transparent"",""stroke"":""#06b6d4"",""strokeWidth"":2}},{{""type"":""i-text"",""text"":""Dữ liệu đầu vào"",""left"":70,""top"":190,""fontSize"":18,""fill"":""#ffffff"",""fontFamily"":""Inter""}},{{""type"":""rect"",""left"":300,""top"":150,""width"":200,""height"":100,""fill"":""transparent"",""stroke"":""#c026d3"",""strokeWidth"":2}}]}}"));
                        // Page 3: Results
                        pages.Add(("#000000", $@"{{""version"":""5.3.0"",""objects"":[{{""type"":""rect"",""left"":0,""top"":0,""width"":800,""height"":450,""fill"":""#000000"",""selectable"":false}},{{""type"":""i-text"",""text"":""KẾT QUẢ ĐẠT ĐƯỢC"",""left"":50,""top"":50,""fontSize"":30,""fill"":""#06b6d4"",""fontFamily"":""Inter"",""fontWeight"":""bold""}},{{""type"":""i-text"",""text"":""Độ chính xác: 98.5%\nThời gian xử lý: 0.02s\nTối ưu tài nguyên CPU: 40%"",""left"":50,""top"":150,""fontSize"":24,""fill"":""#f3f4f6"",""fontFamily"":""Inter"",""lineHeight"":1.8}}]}}"));
                    }
                    else // Sáng tạo
                    {
                        title = $"Creative Portfolio [{i}]";
                        // Page 1: Cover
                        pages.Add(("#ffffff", $@"{{""version"":""5.3.0"",""objects"":[{{""type"":""rect"",""left"":0,""top"":0,""width"":800,""height"":450,""fill"":""#ffffff"",""selectable"":false}},{{""type"":""circle"",""left"":500,""top"":100,""radius"":200,""fill"":""#fbcfe8"",""opacity"":0.6}},{{""type"":""image"",""src"":""https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=300&h=300&auto=format&fit=crop"",""left"":450,""top"":75,""width"":300,""height"":300,""crossOrigin"":""anonymous""}},{{""type"":""i-text"",""text"":""{title.ToUpper()}"",""left"":60,""top"":180,""fontSize"":48,""fill"":""#be185d"",""fontFamily"":""Inter"",""fontWeight"":""bold""}},{{""type"":""rect"",""left"":60,""top"":260,""width"":120,""height"":35,""fill"":""#f97316"",""rx"":15,""ry"":15}}]}}"));
                        // Page 2: About Me
                        pages.Add(("#fdf4ff", $@"{{""version"":""5.3.0"",""objects"":[{{""type"":""rect"",""left"":0,""top"":0,""width"":800,""height"":450,""fill"":""#fdf4ff"",""selectable"":false}},{{""type"":""triangle"",""left"":-50,""top"":200,""width"":200,""height"":200,""fill"":""#f97316"",""angle"":45,""opacity"":0.2}},{{""type"":""i-text"",""text"":""VỀ TÔI"",""left"":100,""top"":80,""fontSize"":36,""fill"":""#be185d"",""fontFamily"":""Inter"",""fontWeight"":""bold""}},{{""type"":""i-text"",""text"":""Xin chào, tôi là một nhà thiết kế UI/UX đam mê\ntạo ra những trải nghiệm số tuyệt vời...\nSở trường của tôi là màu sắc và typography."",""left"":100,""top"":160,""fontSize"":20,""fill"":""#475569"",""fontFamily"":""Inter"",""lineHeight"":1.6}}]}}"));
                        // Page 3: Projects
                        pages.Add(("#ffffff", $@"{{""version"":""5.3.0"",""objects"":[{{""type"":""rect"",""left"":0,""top"":0,""width"":800,""height"":450,""fill"":""#ffffff"",""selectable"":false}},{{""type"":""i-text"",""text"":""DỰ ÁN NỔI BẬT"",""left"":50,""top"":50,""fontSize"":32,""fill"":""#db2777"",""fontFamily"":""Inter"",""fontWeight"":""bold""}},{{""type"":""rect"",""left"":50,""top"":120,""width"":220,""height"":200,""fill"":""#fce7f3""}},{{""type"":""rect"",""left"":290,""top"":120,""width"":220,""height"":200,""fill"":""#fed7aa""}},{{""type"":""rect"",""left"":530,""top"":120,""width"":220,""height"":200,""fill"":""#e0e7ff""}}]}}"));
                    }

                    CreateTemplate(title, category, pages, "");
                }

                context.SaveChanges();
            }
        }
    }
}
