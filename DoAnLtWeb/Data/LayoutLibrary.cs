using System.Collections.Generic;
using System.Linq;
using static DoAnLtWeb.Data.TemplateKit;

namespace DoAnLtWeb.Data
{
    // Slot of content fed into a layout. Layouts pick what they need; missing slots
    // fall back to neutral placeholders so a layout is always renderable.
    public record SlideContent(
        string? Kicker = null,
        string? Title = null,
        string? Subtitle = null,
        string? Body = null,
        string? Footer = null,
        string? Author = null,
        string? AuthorRole = null,
        List<string>? Bullets = null,        // short labels
        List<string>? Descriptions = null,   // long-form lines, paired with Bullets
        List<(string Stat, string Label)>? Stats = null,
        List<(string Step, string Title, string Desc)>? Steps = null,
        List<(string Name, string Role, string Bio)>? People = null,
        List<(string Col1, string Col2, string Col3, string Col4)>? Rows = null,
        List<string>? Quotes = null,
        string? Icon = null,
        List<string>? IconRow = null
    );

    public record SlideOutput(string Background, List<object> Objects);

    public static class LayoutLibrary
    {
        // Every layout reserves: 80px side margin, 720 canvas height, 60-100px top breathing room.

        public delegate SlideOutput LayoutFn(Palette p, SlideContent c, string displayFont);

        public static readonly Dictionary<string, LayoutFn> All = new()
        {
            ["cover-side"] = CoverSide,
            ["cover-centered"] = CoverCentered,
            ["cover-split"] = CoverSplit,
            ["agenda"] = Agenda,
            ["section-divider"] = SectionDivider,
            ["bullets-3"] = Bullets3,
            ["bullets-4"] = Bullets4,
            ["two-column"] = TwoColumn,
            ["stats-3"] = Stats3,
            ["stats-4"] = Stats4,
            ["timeline-4"] = Timeline4,
            ["process-steps"] = ProcessSteps,
            ["quote"] = Quote,
            ["table"] = Table,
            ["team-3"] = Team3,
            ["icon-grid"] = IconGrid,
            ["image-text"] = ImageText,
            ["closing"] = Closing,
            ["pricing-3"] = Pricing3,
            ["chart-bars"] = ChartBars,
            ["faq"] = Faq,
        };

        // ---------- Helpers ----------
        private static List<object> NewSlide(Palette p)
        {
            return new List<object> { Rect(0, 0, CanvasWidth, CanvasHeight, p.Bg, id: "bg") };
        }

        private static string Truncate(string s, int max)
        {
            if (string.IsNullOrEmpty(s) || s.Length <= max) return s ?? string.Empty;
            return s.Substring(0, max - 1) + "…";
        }

        // ---------- Layouts ----------

        public static SlideOutput CoverSide(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Rect(0, 0, 8, CanvasHeight, p.Accent, id: "side-bar"));
            els.Add(Rect(80, 90, 60, 4, p.Accent, id: "cover-mark"));
            els.Add(Text(c.Kicker ?? "GIỚI THIỆU", 80, 110, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Tiêu đề bài thuyết trình của bạn",
                80, 200, 1100, 60, p.Ink, 700, fontFamily: displayFont, id: "title", lineHeight: 1.1));
            els.Add(Text(c.Subtitle ?? "Phụ đề ngắn gọn — một dòng mô tả nội dung tổng quan.",
                80, 400, 900, 20, p.Mute, 400, id: "subtitle", lineHeight: 1.4));
            els.Add(Rect(80, 600, 380, 1, p.Line, id: "divider"));
            els.Add(Text(c.Footer ?? "Tác giả · 2026", 80, 620, 600, 13, p.Mute, 600, id: "footer"));
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput CoverCentered(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Circle(-80, -80, 240, p.Accent, opacity: 0.18, id: "blob-tl"));
            els.Add(Circle(CanvasWidth - 160, CanvasHeight - 160, 280, p.Accent, opacity: 0.12, id: "blob-br"));
            els.Add(Text(c.Kicker ?? "GIỚI THIỆU", 80, 200, 1120, 14, p.Accent, 700, textAlign: "center", id: "kicker"));
            els.Add(Text(c.Title ?? "Tiêu đề trung tâm", 80, 250, 1120, 64, p.Ink, 700,
                fontFamily: displayFont, textAlign: "center", id: "title", lineHeight: 1.1));
            els.Add(Rect(610, 420, 60, 3, p.Accent, id: "rule"));
            els.Add(Text(c.Subtitle ?? "Phụ đề ngắn gọn — một dòng giới thiệu chủ đề.",
                80, 450, 1120, 20, p.Mute, 400, textAlign: "center", id: "subtitle"));
            els.Add(Text(c.Footer ?? "Tác giả · 2026", 80, 620, 1120, 13, p.Mute, 600, textAlign: "center", id: "footer"));
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput CoverSplit(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Rect(640, 0, 640, CanvasHeight, p.Surface, id: "right-panel"));
            els.Add(Text(c.Kicker ?? "GIỚI THIỆU", 80, 130, 500, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Tiêu đề bên trái\nchia hai cột", 80, 200, 540, 52, p.Ink, 700,
                fontFamily: displayFont, id: "title", lineHeight: 1.1));
            els.Add(Rect(80, 440, 60, 3, p.Accent, id: "rule"));
            els.Add(Text(c.Subtitle ?? "Phụ đề ở cột trái — giải thích bối cảnh ngắn gọn.",
                80, 460, 500, 18, p.Mute, 400, id: "subtitle", lineHeight: 1.5));
            // right panel: big icon as visual anchor
            els.AddRange(Icon(c.Icon ?? "spark", 820, 220, p.Accent, 280));
            els.Add(Text(c.Footer ?? "PROJECT · 2026", 720, 580, 480, 13, p.Mute, 700, textAlign: "center", id: "right-footer"));
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput SectionDivider(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Rect(0, 320, CanvasWidth, 4, p.Accent, opacity: 0.4, id: "hairline"));
            els.Add(Text(c.Kicker ?? "PHẦN", 80, 240, 1120, 16, p.Accent, 700, textAlign: "center", id: "kicker"));
            els.Add(Text(c.Title ?? "Tên phần", 80, 280, 1120, 80, p.Ink, 700,
                fontFamily: displayFont, textAlign: "center", id: "title"));
            els.Add(Text(c.Subtitle ?? "Mô tả ngắn phần này.", 80, 420, 1120, 18, p.Mute, 400,
                textAlign: "center", id: "subtitle"));
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput Agenda(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Text(c.Kicker ?? "NỘI DUNG", 80, 70, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Chương trình", 80, 100, 800, 44, p.Ink, 700,
                fontFamily: displayFont, id: "title"));
            var bullets = c.Bullets ?? new List<string> { "Mục một", "Mục hai", "Mục ba", "Mục bốn", "Mục năm" };
            var descs = c.Descriptions ?? new List<string>();
            int n = System.Math.Min(bullets.Count, 6);
            double y0 = 200;
            double step = (CanvasHeight - 260) / System.Math.Max(n, 1);
            for (int i = 0; i < n; i++)
            {
                double y = y0 + i * step;
                els.Add(Text($"{i + 1:00}", 80, y, 80, 28, p.Accent, 700, id: $"ag-num-{i}"));
                els.Add(Rect(160, y + 6, 1, 40, p.Mute, id: $"ag-rule-{i}"));
                els.Add(Text(bullets[i], 190, y, 900, 22, p.Ink, 700, id: $"ag-t-{i}"));
                if (i < descs.Count)
                {
                    els.Add(Text(Truncate(descs[i], 110), 190, y + 32, 900, 14, p.Mute, 400, id: $"ag-d-{i}"));
                }
            }
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput Bullets3(Palette p, SlideContent c, string displayFont)
            => BulletsN(p, c, displayFont, 3);

        public static SlideOutput Bullets4(Palette p, SlideContent c, string displayFont)
            => BulletsN(p, c, displayFont, 4);

        private static SlideOutput BulletsN(Palette p, SlideContent c, string displayFont, int n)
        {
            var els = NewSlide(p);
            els.Add(Text(c.Kicker ?? "Ý CHÍNH", 80, 70, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? $"{n} điểm cốt lõi", 80, 100, 1100, 40, p.Ink, 700,
                fontFamily: displayFont, id: "title"));
            var bullets = c.Bullets ?? Enumerable.Range(1, n).Select(i => $"Điểm {i}").ToList();
            var descs = c.Descriptions ?? Enumerable.Repeat("Mô tả chi tiết về ý này — chỉnh sửa được trực tiếp.", n).ToList();
            var icons = c.IconRow ?? new List<string> { "check", "spark", "target", "bulb", "gear", "rocket" };
            double total = CanvasWidth - 160;
            double gap = 20;
            double w = (total - gap * (n - 1)) / n;
            for (int i = 0; i < n; i++)
            {
                double x = 80 + i * (w + gap);
                els.Add(Rect(x, 220, w, 400, p.Surface, rx: 12, ry: 12, id: $"card-{i}"));
                els.AddRange(Icon(icons[i % icons.Count], x + 30, 250, p.Accent, 56));
                els.Add(Text(i < bullets.Count ? bullets[i] : $"Điểm {i + 1}", x + 30, 340, w - 60, 22, p.Ink, 700, id: $"b-t-{i}"));
                els.Add(Text(i < descs.Count ? descs[i] : "Mô tả ý này.", x + 30, 380, w - 60, 16, p.Mute, 400,
                    id: $"b-d-{i}", lineHeight: 1.5));
            }
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput TwoColumn(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Text(c.Kicker ?? "SO SÁNH", 80, 70, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Hai mặt của vấn đề", 80, 100, 1100, 40, p.Ink, 700,
                fontFamily: displayFont, id: "title"));
            var bullets = c.Bullets ?? new List<string> { "Trước", "Sau" };
            var descs = c.Descriptions ?? new List<string>
            {
                "• Mô tả tình huống trước.\n• Vấn đề và giới hạn.\n• Tác động đến người dùng.",
                "• Cách tiếp cận mới.\n• Lợi ích và kết quả.\n• Khả năng mở rộng."
            };
            els.Add(Rect(80, 200, 540, 420, p.Surface, rx: 12, ry: 12, id: "left-card"));
            els.Add(Text(bullets.Count > 0 ? bullets[0] : "Trước", 110, 230, 480, 14, p.Accent, 700, id: "left-tag"));
            els.Add(Text(descs.Count > 0 ? descs[0] : "", 110, 270, 480, 18, p.Ink, 500, id: "left-body", lineHeight: 1.7));
            els.Add(Rect(660, 200, 540, 420, p.Surface, rx: 12, ry: 12, id: "right-card"));
            els.Add(Rect(660, 200, 6, 420, p.Accent, id: "right-bar"));
            els.Add(Text(bullets.Count > 1 ? bullets[1] : "Sau", 690, 230, 480, 14, p.Accent, 700, id: "right-tag"));
            els.Add(Text(descs.Count > 1 ? descs[1] : "", 690, 270, 480, 18, p.Ink, 500, id: "right-body", lineHeight: 1.7));
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput Stats3(Palette p, SlideContent c, string displayFont) => StatsN(p, c, displayFont, 3);
        public static SlideOutput Stats4(Palette p, SlideContent c, string displayFont) => StatsN(p, c, displayFont, 4);

        private static SlideOutput StatsN(Palette p, SlideContent c, string displayFont, int n)
        {
            var els = NewSlide(p);
            els.Add(Text(c.Kicker ?? "CHỈ SỐ", 80, 70, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? $"{n} con số đáng chú ý", 80, 100, 1100, 40, p.Ink, 700,
                fontFamily: displayFont, id: "title"));
            var stats = c.Stats ?? Enumerable.Range(1, n).Select(i => ($"+{i}0%", $"Chỉ số {i}")).ToList();
            double total = CanvasWidth - 160;
            double gap = 20;
            double w = (total - gap * (n - 1)) / n;
            for (int i = 0; i < n; i++)
            {
                double x = 80 + i * (w + gap);
                els.Add(Rect(x, 220, w, 320, p.Surface, rx: 12, ry: 12, id: $"stat-{i}"));
                els.Add(Rect(x, 220, w, 4, p.Accent, id: $"stat-top-{i}"));
                var s = i < stats.Count ? stats[i] : ("—", "—");
                els.Add(Text(s.Item1, x + 20, 260, w - 40, 52, p.Ink, 700, fontFamily: displayFont, id: $"stat-n-{i}"));
                els.Add(Text(s.Item2, x + 20, 360, w - 40, 16, p.Mute, 500, id: $"stat-l-{i}", lineHeight: 1.4));
            }
            els.Add(Text(c.Footer ?? "Nguồn: dữ liệu nội bộ.", 80, 600, 1100, 13, p.Mute, 400, id: "src"));
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput Timeline4(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Text(c.Kicker ?? "LỘ TRÌNH", 80, 70, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Bốn giai đoạn", 80, 100, 1100, 40, p.Ink, 700,
                fontFamily: displayFont, id: "title"));
            els.Add(Rect(110, 360, 1060, 2, p.Line, id: "rl"));
            var steps = c.Steps ?? new List<(string, string, string)>
            {
                ("Q1", "Chẩn đoán", "Đánh giá hiện trạng và mục tiêu."),
                ("Q2", "Thiết kế", "Phác thảo mô hình mới."),
                ("Q3", "Triển khai", "Thí điểm tại một vài đơn vị."),
                ("Q4", "Nhân rộng", "Mở rộng quy mô và đánh giá.")
            };
            int n = System.Math.Min(steps.Count, 4);
            double step = 1060.0 / n;
            for (int i = 0; i < n; i++)
            {
                double x = 110 + i * step;
                els.Add(Circle(x + step / 2 - 12, 348, 12, p.Accent, id: $"tl-dot-{i}"));
                els.Add(Text(steps[i].Item1, x, 280, step, 14, p.Accent, 700, id: $"tl-q-{i}"));
                els.Add(Text(steps[i].Item2, x, 308, step, 22, p.Ink, 700, fontFamily: displayFont, id: $"tl-t-{i}"));
                els.Add(Text(steps[i].Item3, x, 400, step - 20, 14, p.Mute, 400, id: $"tl-d-{i}", lineHeight: 1.5));
            }
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput ProcessSteps(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Text(c.Kicker ?? "QUY TRÌNH", 80, 70, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Năm bước", 80, 100, 1100, 40, p.Ink, 700,
                fontFamily: displayFont, id: "title"));
            var steps = c.Steps ?? Enumerable.Range(1, 5).Select(i =>
                ($"0{i}", $"Bước {i}", "Mô tả ngắn cho bước này.")).ToList();
            int n = System.Math.Min(steps.Count, 5);
            double y0 = 210;
            double sh = (CanvasHeight - y0 - 60) / n;
            for (int i = 0; i < n; i++)
            {
                double y = y0 + i * sh;
                els.Add(Rect(80, y, 1120, sh - 12, p.Surface, rx: 10, ry: 10, id: $"ps-card-{i}"));
                els.Add(Rect(80, y, 6, sh - 12, p.Accent, id: $"ps-bar-{i}"));
                els.Add(Text(steps[i].Item1, 110, y + 18, 80, 24, p.Accent, 700, id: $"ps-s-{i}"));
                els.Add(Text(steps[i].Item2, 200, y + 14, 700, 22, p.Ink, 700, id: $"ps-t-{i}"));
                els.Add(Text(Truncate(steps[i].Item3, 140), 200, y + 44, 950, 15, p.Mute, 400, id: $"ps-d-{i}", lineHeight: 1.4));
            }
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput Quote(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Text("“", 80, 130, 200, 200, p.Accent, 700, fontFamily: displayFont, id: "quote-mark"));
            var q = (c.Quotes != null && c.Quotes.Count > 0) ? c.Quotes[0]
                : c.Title ?? "Một câu trích dẫn ngắn — gọn, mạnh và liên quan đến chủ đề.";
            els.Add(Text(q, 220, 220, 950, 36, p.Ink, 600, fontFamily: displayFont, id: "quote", lineHeight: 1.35));
            els.Add(Rect(220, 480, 60, 3, p.Accent, id: "rule"));
            els.Add(Text(c.Author ?? "TÁC GIẢ", 220, 500, 600, 14, p.Accent, 700, id: "author"));
            els.Add(Text(c.AuthorRole ?? "Vị trí · Tổ chức", 220, 526, 600, 13, p.Mute, 400, id: "author-role"));
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput Table(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Text(c.Kicker ?? "BẢNG SO SÁNH", 80, 70, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Đối chiếu bốn cột", 80, 100, 1100, 40, p.Ink, 700,
                fontFamily: displayFont, id: "title"));
            var headers = c.Bullets ?? new List<string> { "Tiêu chí", "Phương án A", "Phương án B", "Phương án C" };
            var rows = c.Rows ?? new List<(string, string, string, string)>
            {
                ("Chi phí", "Thấp", "Trung bình", "Cao"),
                ("Thời gian", "Nhanh", "Trung bình", "Chậm"),
                ("Rủi ro", "Cao", "Trung bình", "Thấp"),
                ("Mở rộng", "Khó", "Trung bình", "Dễ")
            };
            // header
            els.Add(Rect(80, 200, 1120, 50, p.Ink, id: "thead"));
            double[] colX = { 110, 460, 720, 980 };
            for (int i = 0; i < 4 && i < headers.Count; i++)
            {
                els.Add(Text(headers[i], colX[i], 215, 220, 13, p.Bg, 700, id: $"th-{i}"));
            }
            for (int r = 0; r < rows.Count && r < 5; r++)
            {
                double y = 260 + r * 60;
                els.Add(Rect(80, y + 50, 1120, 1, p.Line, id: $"row-sep-{r}"));
                els.Add(Text(rows[r].Item1, colX[0], y + 12, 320, 16, p.Ink, 600, id: $"r{r}c0"));
                els.Add(Text(rows[r].Item2, colX[1], y + 12, 240, 16, p.Mute, 400, id: $"r{r}c1"));
                els.Add(Text(rows[r].Item3, colX[2], y + 12, 240, 16, p.Mute, 400, id: $"r{r}c2"));
                els.Add(Text(rows[r].Item4, colX[3], y + 12, 240, 16, p.Ink, 600, id: $"r{r}c3"));
            }
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput Team3(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Text(c.Kicker ?? "ĐỘI NGŨ", 80, 70, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Người đứng sau dự án", 80, 100, 1100, 40, p.Ink, 700,
                fontFamily: displayFont, id: "title"));
            var people = c.People ?? new List<(string, string, string)>
            {
                ("Trần A", "Trưởng dự án", "10 năm kinh nghiệm vận hành."),
                ("Nguyễn B", "Phụ trách kỹ thuật", "Cựu kỹ sư hệ thống quy mô lớn."),
                ("Lê C", "Phụ trách thiết kế", "Định hướng trải nghiệm và thương hiệu.")
            };
            for (int i = 0; i < 3 && i < people.Count; i++)
            {
                double x = 80 + i * 380;
                els.Add(Rect(x, 220, 360, 380, p.Surface, rx: 16, ry: 16, id: $"tm-{i}"));
                els.Add(Circle(x + 150, 250, 60, p.Accent, opacity: 0.85, id: $"tm-av-{i}"));
                els.Add(Text(people[i].Item1.Substring(0, 1), x + 170, 282, 80, 32, p.Surface, 700,
                    fontFamily: displayFont, id: $"tm-init-{i}"));
                els.Add(Text(people[i].Item1, x + 20, 400, 320, 24, p.Ink, 700,
                    fontFamily: displayFont, textAlign: "center", id: $"tm-n-{i}"));
                els.Add(Text(people[i].Item2, x + 20, 436, 320, 14, p.Accent, 600, textAlign: "center", id: $"tm-r-{i}"));
                els.Add(Rect(x + 170, 470, 20, 2, p.Accent, id: $"tm-rl-{i}"));
                els.Add(Text(people[i].Item3, x + 30, 490, 300, 14, p.Mute, 400, textAlign: "center",
                    id: $"tm-b-{i}", lineHeight: 1.5));
            }
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput IconGrid(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Text(c.Kicker ?? "GIÁ TRỊ CỐT LÕI", 80, 70, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Sáu giá trị chúng tôi theo đuổi", 80, 100, 1100, 40, p.Ink, 700,
                fontFamily: displayFont, id: "title"));
            var bullets = c.Bullets ?? new List<string> { "Tin cậy", "Tốc độ", "Đơn giản", "Minh bạch", "Tận tâm", "Sáng tạo" };
            var descs = c.Descriptions ?? Enumerable.Repeat("Mô tả ngắn cho giá trị này.", 6).ToList();
            var icons = c.IconRow ?? new List<string> { "shield", "rocket", "spark", "doc", "heart", "bulb" };
            for (int i = 0; i < 6 && i < bullets.Count; i++)
            {
                int col = i % 3;
                int row = i / 3;
                double x = 80 + col * 380;
                double y = 220 + row * 200;
                els.Add(Rect(x, y, 360, 180, p.Surface, rx: 12, ry: 12, id: $"ig-card-{i}"));
                els.AddRange(Icon(icons[i % icons.Count], x + 26, y + 26, p.Accent, 44));
                els.Add(Text(bullets[i], x + 90, y + 30, 250, 18, p.Ink, 700, id: $"ig-t-{i}"));
                els.Add(Text(i < descs.Count ? Truncate(descs[i], 100) : "", x + 26, y + 80, 320, 14,
                    p.Mute, 400, id: $"ig-d-{i}", lineHeight: 1.5));
            }
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput ImageText(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            // Left: image frame placeholder with decorative shapes
            els.Add(Rect(80, 110, 540, 500, p.Surface, rx: 12, ry: 12, id: "img-frame"));
            els.AddRange(Icon(c.Icon ?? "camera", 270, 290, p.Accent, 160));
            els.Add(Text("[ Thay ảnh tại đây ]", 80, 560, 540, 14, p.Mute, 600, textAlign: "center", id: "img-hint"));
            // Right: text
            els.Add(Text(c.Kicker ?? "CHI TIẾT", 660, 130, 540, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Một câu chuyện đáng kể", 660, 160, 540, 36, p.Ink, 700,
                fontFamily: displayFont, id: "title", lineHeight: 1.2));
            els.Add(Rect(660, 280, 40, 3, p.Accent, id: "rule"));
            els.Add(Text(c.Body ?? "Văn bản mô tả dài hơn ở đây. Có thể thay bằng đoạn giới thiệu sản phẩm, tóm tắt nghiên cứu, hoặc lời mở đầu cho phần tiếp theo.",
                660, 300, 540, 18, p.Mute, 400, id: "body", lineHeight: 1.6));
            if (c.Bullets != null && c.Bullets.Count > 0)
            {
                for (int i = 0; i < c.Bullets.Count && i < 3; i++)
                {
                    double y = 460 + i * 50;
                    els.Add(Circle(660, y + 8, 5, p.Accent, id: $"it-dot-{i}"));
                    els.Add(Text(c.Bullets[i], 685, y, 500, 16, p.Ink, 600, id: $"it-b-{i}"));
                }
            }
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput Closing(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Rect(0, 0, CanvasWidth, CanvasHeight, p.Accent, id: "bg-flood"));
            string fg = p.Dark ? p.Ink : "#FFFFFF";
            string fgMute = p.Dark ? p.Mute : "#FFFFFFCC";
            els.Add(Text(c.Kicker ?? "CẢM ƠN", 80, 220, 1120, 16, fg, 700, textAlign: "center", id: "kicker"));
            els.Add(Text(c.Title ?? "Hỏi & đáp", 80, 260, 1120, 80, fg, 700, fontFamily: displayFont,
                textAlign: "center", id: "title"));
            els.Add(Text(c.Subtitle ?? "Cảm ơn bạn đã lắng nghe.", 80, 380, 1120, 22, fgMute, 400,
                textAlign: "center", id: "sub"));
            els.Add(Rect(610, 480, 60, 2, fg, id: "rule"));
            els.Add(Text(c.Footer ?? "email@domain.com   ·   @brand", 80, 500, 1120, 16, fg, 600,
                textAlign: "center", id: "contact"));
            return new SlideOutput(p.Accent, els);
        }

        public static SlideOutput Pricing3(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Text(c.Kicker ?? "GÓI DỊCH VỤ", 80, 70, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Ba lựa chọn", 80, 100, 1100, 40, p.Ink, 700,
                fontFamily: displayFont, id: "title"));
            var plans = c.Stats ?? new List<(string, string)>
            {
                ("199K", "Starter"),
                ("499K", "Pro"),
                ("999K", "Enterprise")
            };
            var notes = c.Descriptions ?? new List<string>
            {
                "• 1 user\n• 10 dự án\n• Email support",
                "• 10 users\n• Không giới hạn dự án\n• Hỗ trợ ưu tiên",
                "• Không giới hạn\n• SSO + audit\n• Quản lý riêng"
            };
            for (int i = 0; i < 3 && i < plans.Count; i++)
            {
                double x = 80 + i * 380;
                bool highlight = i == 1;
                string fill = highlight ? p.Accent : p.Surface;
                string ink = highlight && !p.Dark ? "#FFFFFF" : p.Ink;
                string mute = highlight && !p.Dark ? "#FFFFFFCC" : p.Mute;
                els.Add(Rect(x, 220, 360, 400, fill, rx: 16, ry: 16, id: $"pr-{i}"));
                els.Add(Text(plans[i].Item2, x + 30, 250, 300, 16, mute, 700, id: $"pr-name-{i}"));
                els.Add(Text(plans[i].Item1, x + 30, 280, 300, 48, ink, 700, fontFamily: displayFont, id: $"pr-price-{i}"));
                els.Add(Text("/ tháng", x + 30, 340, 300, 13, mute, 400, id: $"pr-per-{i}"));
                els.Add(Rect(x + 30, 380, 60, 1, highlight ? "#FFFFFF80" : p.Line, id: $"pr-rule-{i}"));
                els.Add(Text(i < notes.Count ? notes[i] : "", x + 30, 400, 300, 16, ink, 400,
                    id: $"pr-n-{i}", lineHeight: 1.8));
            }
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput ChartBars(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Text(c.Kicker ?? "BIỂU ĐỒ", 80, 70, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Xu hướng qua thời gian", 80, 100, 1100, 40, p.Ink, 700,
                fontFamily: displayFont, id: "title"));
            var bars = c.Stats ?? new List<(string, string)>
            {
                ("32", "T1"), ("45", "T2"), ("58", "T3"), ("64", "T4"), ("71", "T5"), ("82", "T6"), ("95", "T7")
            };
            int n = System.Math.Min(bars.Count, 8);
            double area = 1120;
            double gap = 24;
            double barW = (area - gap * (n - 1)) / n;
            // baseline
            els.Add(Rect(80, 580, 1120, 2, p.Line, id: "axis"));
            int maxVal = 0;
            int[] vals = new int[n];
            for (int i = 0; i < n; i++)
            {
                int.TryParse(new string(bars[i].Item1.Where(char.IsDigit).ToArray()), out vals[i]);
                if (vals[i] > maxVal) maxVal = vals[i];
            }
            if (maxVal == 0) maxVal = 100;
            double topY = 230;
            double maxH = 580 - topY;
            for (int i = 0; i < n; i++)
            {
                double h = vals[i] * maxH / maxVal;
                double x = 80 + i * (barW + gap);
                els.Add(Rect(x, 580 - h, barW, h, p.Accent, rx: 6, ry: 6, id: $"bar-{i}"));
                els.Add(Text(bars[i].Item1, x, 580 - h - 28, barW, 16, p.Ink, 700, textAlign: "center", id: $"bv-{i}"));
                els.Add(Text(bars[i].Item2, x, 595, barW, 13, p.Mute, 500, textAlign: "center", id: $"bl-{i}"));
            }
            els.Add(Text(c.Footer ?? "Nguồn: dữ liệu nội bộ.", 80, 660, 1100, 13, p.Mute, 400, id: "src"));
            return new SlideOutput(p.Bg, els);
        }

        public static SlideOutput Faq(Palette p, SlideContent c, string displayFont)
        {
            var els = NewSlide(p);
            els.Add(Text(c.Kicker ?? "HỎI ĐÁP", 80, 70, 600, 14, p.Accent, 700, id: "kicker"));
            els.Add(Text(c.Title ?? "Câu hỏi thường gặp", 80, 100, 1100, 40, p.Ink, 700,
                fontFamily: displayFont, id: "title"));
            var qs = c.Bullets ?? new List<string>
            {
                "Khi nào nên bắt đầu?", "Chi phí dự kiến?", "Ai phụ trách triển khai?", "Đo lường kết quả thế nào?"
            };
            var ans = c.Descriptions ?? Enumerable.Repeat("Trả lời ngắn gọn, một đến hai câu.", qs.Count).ToList();
            int n = System.Math.Min(qs.Count, 4);
            for (int i = 0; i < n; i++)
            {
                double y = 220 + i * 100;
                els.Add(Rect(80, y, 1120, 84, p.Surface, rx: 10, ry: 10, id: $"faq-{i}"));
                els.Add(Text("Q", 110, y + 14, 40, 22, p.Accent, 700, id: $"faq-q-{i}"));
                els.Add(Text(qs[i], 160, y + 14, 1000, 18, p.Ink, 700, id: $"faq-qt-{i}"));
                els.Add(Text(i < ans.Count ? Truncate(ans[i], 160) : "", 160, y + 46, 1000, 14, p.Mute, 400,
                    id: $"faq-a-{i}", lineHeight: 1.5));
            }
            return new SlideOutput(p.Bg, els);
        }
    }
}
