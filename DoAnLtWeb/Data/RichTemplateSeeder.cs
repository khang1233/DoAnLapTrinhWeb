using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using DoAnLtWeb.Models;
using static DoAnLtWeb.Data.TemplateKit;

namespace DoAnLtWeb.Data
{
    // Walks every topic × deck spec and assembles real Presentation/Slide entities.
    // Output: 56 decks (7 topics × 8 specs each), slide counts 9..30 depending on the layout pattern.
    public static class RichTemplateSeeder
    {
        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };

        public static List<Presentation> BuildTemplates(int adminUserId)
        {
            var now = DateTime.UtcNow;
            var decks = new List<Presentation>();

            foreach (var topic in Topics)
            {
                if (!ContentLibrary.Packs.TryGetValue(topic.Key, out var pack)) continue;

                for (int specIdx = 0; specIdx < pack.Decks.Count; specIdx++)
                {
                    var spec = pack.Decks[specIdx];
                    var palette = topic.Palettes[specIdx % topic.Palettes.Count];
                    var displayFont = topic.DisplayFont;
                    var slides = BuildSlides(spec, palette, displayFont, pack, specIdx);

                    var pres = new Presentation
                    {
                        Title = spec.Title,
                        Category = $"Slidify Mẫu / {topic.Name}",
                        UserId = adminUserId,
                        IsTemplate = true,
                        IsPremiumTemplate = slides.Count >= 22,
                        PremiumReason = slides.Count >= 22 ? "Bộ slide dài, nhiều layout cao cấp." : string.Empty,
                        ThumbnailUrl = string.Empty,
                        CreatedAt = now.AddMinutes(-decks.Count),
                        UpdatedAt = now
                    };
                    int page = 1;
                    foreach (var s in slides)
                    {
                        pres.Slides.Add(new Slide
                        {
                            PageNumber = page++,
                            BackgroundColor = s.Background,
                            BackgroundImage = string.Empty,
                            ElementsJson = WrapCanvas(s.Objects, s.Background)
                        });
                    }
                    decks.Add(pres);
                }
            }
            return decks;
        }

        // Mutable cursor bag so local helpers can advance the same indices without `ref`.
        private class Cursors
        {
            public int Kicker, Bullet, Desc, Stat, Step, Quote, People, Icon, Section;
        }

        private static List<SlideOutput> BuildSlides(DeckSpec spec, Palette palette, string displayFont,
            TopicPack pack, int specIdx)
        {
            var result = new List<SlideOutput>();
            var pattern = spec.LayoutOrder;
            var cur = new Cursors();
            var sectionTitles = new List<string>
            {
                "Bối cảnh", "Vấn đề", "Giải pháp", "Triển khai", "Đo lường", "Tổng kết",
                "Hành trình", "Phân tích sâu", "Đề xuất"
            };

            for (int i = 0; i < pattern.Count; i++)
            {
                var layoutKey = pattern[i];
                var content = BuildContentFor(layoutKey, spec, palette, pack, cur, sectionTitles, specIdx);
                if (!LayoutLibrary.All.TryGetValue(layoutKey, out var fn))
                {
                    fn = LayoutLibrary.All["bullets-3"];
                }
                result.Add(fn(palette, content, displayFont));
            }
            return result;
        }

        private static SlideContent BuildContentFor(string layout, DeckSpec spec, Palette p, TopicPack pack,
            Cursors cur, List<string> sectionTitles, int specIdx)
        {
            string PickK() { var v = pack.Kickers.Count == 0 ? "" : pack.Kickers[cur.Kicker % pack.Kickers.Count]; cur.Kicker++; return v; }
            string PickB() { var v = pack.Bullets.Count == 0 ? "" : pack.Bullets[cur.Bullet % pack.Bullets.Count]; cur.Bullet++; return v; }
            string PickD() { var v = pack.Descriptions.Count == 0 ? "" : pack.Descriptions[cur.Desc % pack.Descriptions.Count]; cur.Desc++; return v; }
            List<string> TakeB(int n) { var l = new List<string>(); for (int i = 0; i < n; i++) l.Add(PickB()); return l; }
            List<string> TakeD(int n) { var l = new List<string>(); for (int i = 0; i < n; i++) l.Add(PickD()); return l; }
            List<(string, string)> TakeStats(int n)
            {
                var list = new List<(string, string)>();
                for (int i = 0; i < n; i++) { list.Add(pack.Stats[cur.Stat % pack.Stats.Count]); cur.Stat++; }
                return list;
            }
            List<(string, string, string)> TakeSteps(int n)
            {
                var list = new List<(string, string, string)>();
                for (int i = 0; i < n; i++) { list.Add(pack.Steps[cur.Step % pack.Steps.Count]); cur.Step++; }
                return list;
            }
            List<(string, string, string)> TakePeople(int n)
            {
                var list = new List<(string, string, string)>();
                for (int i = 0; i < n; i++) { list.Add(pack.People[cur.People % pack.People.Count]); cur.People++; }
                return list;
            }

            switch (layout)
            {
                case "cover-side":
                case "cover-centered":
                case "cover-split":
                    return new SlideContent(
                        Kicker: spec.FooterTag,
                        Title: spec.Title,
                        Subtitle: spec.Subtitle,
                        Footer: $"{spec.FooterTag.Split('·')[0].Trim()} · 2026",
                        Icon: spec.IconKey
                    );
                case "section-divider":
                    {
                        var title = sectionTitles[cur.Section % sectionTitles.Count];
                        cur.Section++;
                        return new SlideContent(
                            Kicker: $"PHẦN {cur.Section:00}",
                            Title: title,
                            Subtitle: pack.Kickers.Count > 0
                                ? pack.Kickers[(cur.Section + specIdx) % pack.Kickers.Count].ToLower()
                                : null
                        );
                    }
                case "agenda":
                    return new SlideContent(
                        Kicker: "NỘI DUNG",
                        Title: "Chương trình",
                        Bullets: pack.AgendaHeads.Take(6).ToList(),
                        Descriptions: pack.AgendaDescs.Take(6).ToList()
                    );
                case "bullets-3":
                    return new SlideContent(
                        Kicker: PickK(),
                        Title: "Ba điểm nổi bật",
                        Bullets: TakeB(3),
                        Descriptions: TakeD(3),
                        IconRow: pack.Icons.Skip(cur.Icon % pack.Icons.Count).Concat(pack.Icons).Take(3).ToList()
                    );
                case "bullets-4":
                    return new SlideContent(
                        Kicker: PickK(),
                        Title: "Bốn ưu tiên",
                        Bullets: TakeB(4),
                        Descriptions: TakeD(4),
                        IconRow: pack.Icons.Skip(cur.Icon % pack.Icons.Count).Concat(pack.Icons).Take(4).ToList()
                    );
                case "two-column":
                    {
                        var b = TakeB(2);
                        var d = TakeD(2);
                        return new SlideContent(
                            Kicker: PickK(),
                            Title: $"{b[0]} & {b[1]}",
                            Bullets: b,
                            Descriptions: new List<string>
                            {
                                "• " + d[0] + "\n\n• " + PickD(),
                                "• " + d[1] + "\n\n• " + PickD()
                            }
                        );
                    }
                case "stats-3":
                    return new SlideContent(
                        Kicker: PickK(),
                        Title: "Ba con số đáng chú ý",
                        Stats: TakeStats(3),
                        Footer: "Nguồn: dữ liệu nội bộ — 2026."
                    );
                case "stats-4":
                    return new SlideContent(
                        Kicker: PickK(),
                        Title: "Bốn chỉ số then chốt",
                        Stats: TakeStats(4),
                        Footer: "Nguồn: dữ liệu nội bộ — 2026."
                    );
                case "timeline-4":
                    return new SlideContent(
                        Kicker: "LỘ TRÌNH",
                        Title: "Bốn giai đoạn chính",
                        Steps: TakeSteps(4)
                    );
                case "process-steps":
                    return new SlideContent(
                        Kicker: "QUY TRÌNH",
                        Title: "Năm bước thực hiện",
                        Steps: TakeSteps(5)
                    );
                case "quote":
                    {
                        var q = pack.Quotes.Count > 0 ? pack.Quotes[cur.Quote % pack.Quotes.Count] : "Một câu trích dẫn.";
                        string authorName = "TÁC GIẢ";
                        string authorRole = "Tổ chức";
                        if (pack.Authors.Count > 0)
                        {
                            var a = pack.Authors[cur.Quote % pack.Authors.Count];
                            authorName = a.Item1;
                            authorRole = a.Item2;
                        }
                        cur.Quote++;
                        return new SlideContent(
                            Quotes: new List<string> { q },
                            Author: authorName,
                            AuthorRole: authorRole
                        );
                    }
                case "table":
                    {
                        var headers = pack.Rows.Count > 0
                            ? new List<string> { pack.Rows[0].C1, pack.Rows[0].C2, pack.Rows[0].C3, pack.Rows[0].C4 }
                            : new List<string> { "Tiêu chí", "A", "B", "C" };
                        var rows = pack.Rows.Count > 1 ? pack.Rows.Skip(1).Take(4).ToList() : new List<(string, string, string, string)>();
                        return new SlideContent(
                            Kicker: "BẢNG TỔNG HỢP",
                            Title: "Đối chiếu nhanh",
                            Bullets: headers,
                            Rows: rows
                        );
                    }
                case "team-3":
                    return new SlideContent(
                        Kicker: "ĐỘI NGŨ",
                        Title: "Người đứng sau dự án",
                        People: TakePeople(3)
                    );
                case "icon-grid":
                    {
                        var icons = Enumerable.Range(0, 6).Select(k => pack.Icons[(cur.Icon + k) % pack.Icons.Count]).ToList();
                        cur.Icon += 6;
                        return new SlideContent(
                            Kicker: PickK(),
                            Title: "Sáu điểm cần nhớ",
                            Bullets: TakeB(6),
                            Descriptions: TakeD(6),
                            IconRow: icons
                        );
                    }
                case "image-text":
                    return new SlideContent(
                        Kicker: PickK(),
                        Title: spec.Subtitle,
                        Body: PickD() + " " + PickD(),
                        Bullets: TakeB(3),
                        Icon: spec.IconKey
                    );
                case "pricing-3":
                    return new SlideContent(
                        Kicker: "GÓI DỊCH VỤ",
                        Title: "Ba lựa chọn phù hợp",
                        Stats: new List<(string, string)>
                        {
                            ("199K", "Starter"), ("499K", "Pro"), ("999K", "Enterprise")
                        },
                        Descriptions: new List<string>
                        {
                            "• 1 người dùng\n• 10 dự án\n• Email support",
                            "• 10 người dùng\n• Không giới hạn dự án\n• Hỗ trợ ưu tiên",
                            "• Không giới hạn\n• SSO + audit\n• Quản lý chuyên trách"
                        }
                    );
                case "chart-bars":
                    {
                        var series = new List<(string, string)>();
                        int[] seq = { 32, 41, 48, 56, 64, 71, 82, 95 };
                        string[] labels = { "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8" };
                        for (int k = 0; k < 7; k++) series.Add(($"{seq[k]}", labels[k]));
                        return new SlideContent(
                            Kicker: "BIỂU ĐỒ",
                            Title: "Xu hướng theo thời gian",
                            Stats: series,
                            Footer: "Nguồn: dữ liệu nội bộ — 2026."
                        );
                    }
                case "faq":
                    return new SlideContent(
                        Kicker: "HỎI ĐÁP",
                        Title: "Câu hỏi thường gặp",
                        Bullets: new List<string>
                        {
                            "Khi nào nên bắt đầu?",
                            "Chi phí dự kiến bao nhiêu?",
                            "Ai sẽ phụ trách triển khai?",
                            "Đo lường kết quả thế nào?"
                        },
                        Descriptions: TakeD(4)
                    );
                case "closing":
                    return new SlideContent(
                        Kicker: "CẢM ƠN",
                        Title: "Hỏi & đáp",
                        Subtitle: "Cảm ơn bạn đã đồng hành.",
                        Footer: "contact@example.com   ·   2026"
                    );
                default:
                    return new SlideContent(Kicker: PickK(), Title: spec.Title);
            }
        }

        private static string WrapCanvas(List<object> objects, string background)
        {
            var payload = new
            {
                version = "5.3.0",
                objects,
                background,
                canvasWidth = TemplateKit.CanvasWidth,
                canvasHeight = TemplateKit.CanvasHeight
            };
            return JsonSerializer.Serialize(payload, JsonOpts);
        }
    }
}
