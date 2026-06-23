using System.Collections.Generic;

namespace DoAnLtWeb.Data
{
    // Shared types + palette + icon library for the rich template seeder.
    public static class TemplateKit
    {
        public const int CanvasWidth = 1280;
        public const int CanvasHeight = 720;

        // Safe font stacks. Keep these inside the small set we know Fabric.js loads cleanly
        // across Windows / macOS / Linux defaults — avoids font-fallback boxes in the editor.
        public const string SansFont = "Inter, \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif";
        public const string SerifFont = "Georgia, \"Times New Roman\", serif";
        public const string MonoFont = "\"JetBrains Mono\", \"Consolas\", \"Courier New\", monospace";

        public record Palette(
            string Bg,        // canvas background
            string Surface,   // card / panel fill
            string Ink,       // primary text
            string Mute,      // secondary text
            string Accent,    // brand color
            string Soft,      // soft tint of accent (for chips, bars)
            string Line,      // hairline divider
            bool Dark         // true => use light text on accent buttons etc.
        );

        public record Topic(string Key, string Name, List<Palette> Palettes, string SansFont, string DisplayFont);

        public static readonly List<Topic> Topics = new()
        {
            new Topic("kinhdoanh", "Kinh doanh",
                new List<Palette>
                {
                    new("#0F1B2D", "#16263F", "#F5F7FA", "#9AA7BD", "#F4B400", "#2A3A57", "#2A3A57", true),
                    new("#FFFFFF", "#F4F6FA", "#0F172A", "#5C6470", "#0A66C2", "#E2ECF7", "#E5E7EB", false),
                    new("#0B1F3A", "#11294A", "#EAF1FB", "#A6B6CD", "#3FB8AF", "#1D3A63", "#1D3A63", true)
                }, SansFont, SansFont),

            new Topic("giaoduc", "Giáo dục",
                new List<Palette>
                {
                    new("#FFF8F1", "#FFFFFF", "#1E2A36", "#5A6675", "#E2725B", "#FDE5DC", "#E8DCCB", false),
                    new("#F7F4EE", "#FFFFFF", "#1F1B16", "#5C544A", "#7A5C3E", "#EADFCE", "#E2D7C5", false),
                    new("#FFFFFF", "#F2F7F2", "#102820", "#4F6A60", "#2F855A", "#D6EFE0", "#E2EAE5", false)
                }, SansFont, SerifFont),

            new Topic("marketing", "Marketing",
                new List<Palette>
                {
                    new("#FFFFFF", "#FFE8EE", "#101820", "#5C6470", "#FF3366", "#FFD2DE", "#F1D9DE", false),
                    new("#0E0E12", "#1A1A22", "#FAFAFA", "#9A9AB2", "#FFCC00", "#2A2A34", "#2A2A34", true),
                    new("#FDF7FF", "#FFFFFF", "#1A0F2E", "#5F4F7A", "#7C3AED", "#EADCFB", "#EDE3FB", false)
                }, SansFont, SansFont),

            new Topic("congnghe", "Công nghệ",
                new List<Palette>
                {
                    new("#0B0E14", "#141923", "#E6E9EF", "#8A94A6", "#7DF9FF", "#1B2230", "#1F2937", true),
                    new("#0A0F1A", "#10182A", "#F8FAFC", "#94A3B8", "#22D3EE", "#13243D", "#1F2937", true),
                    new("#FFFFFF", "#F1F5F9", "#0F172A", "#475569", "#2563EB", "#DBEAFE", "#E2E8F0", false)
                }, SansFont, SansFont),

            new Topic("khoinghiep", "Khởi nghiệp",
                new List<Palette>
                {
                    new("#0A0E1A", "#111827", "#F8FAFC", "#94A3B8", "#22D3EE", "#13243D", "#1F2937", true),
                    new("#FFFFFF", "#F3F4F6", "#111111", "#6B7280", "#FF6A3D", "#FFE3D6", "#E5E7EB", false),
                    new("#101522", "#1A2236", "#F1F5F9", "#94A3B8", "#A78BFA", "#251F3F", "#2A3149", true)
                }, SansFont, SansFont),

            new Topic("sangtao", "Sáng tạo",
                new List<Palette>
                {
                    new("#F2EDE4", "#FFFFFF", "#1B1B1B", "#6B6B6B", "#C2410C", "#EFDCC9", "#E2D7C5", false),
                    new("#1B1B1B", "#262626", "#F5F5F5", "#A1A1A1", "#F59E0B", "#3A2E1D", "#333333", true),
                    new("#FFFFFF", "#FAFAFA", "#0A0A0A", "#737373", "#EC4899", "#FCE7F3", "#E5E5E5", false)
                }, SerifFont, SerifFont),

            new Topic("sukien", "Sự kiện & Cá nhân",
                new List<Palette>
                {
                    new("#FFF5F7", "#FFFFFF", "#3D1A2C", "#7A5366", "#D9608F", "#FBD7E3", "#F2D7E0", false),
                    new("#101935", "#1A2350", "#F6F4FF", "#A1A5C9", "#FFD166", "#22306A", "#2A3576", true),
                    new("#F8F5F0", "#FFFFFF", "#27241D", "#6F6857", "#3D6470", "#D7E4E8", "#E0DACC", false)
                }, SansFont, SerifFont)
        };

        // ---------- Element factories ----------

        public static Dictionary<string, object?> Rect(double left, double top, double width, double height, string fill,
            double opacity = 1, double rx = 0, double ry = 0, string? id = null, string? stroke = null, double strokeWidth = 0,
            double angle = 0)
        {
            return new Dictionary<string, object?>
            {
                ["type"] = "rect",
                ["version"] = "5.3.0",
                ["originX"] = "left",
                ["originY"] = "top",
                ["left"] = left,
                ["top"] = top,
                ["width"] = width,
                ["height"] = height,
                ["fill"] = fill,
                ["stroke"] = stroke,
                ["strokeWidth"] = strokeWidth,
                ["scaleX"] = 1,
                ["scaleY"] = 1,
                ["opacity"] = opacity,
                ["angle"] = angle,
                ["rx"] = rx,
                ["ry"] = ry,
                ["selectable"] = true,
                ["hasControls"] = true,
                ["id"] = id
            };
        }

        public static Dictionary<string, object?> Circle(double left, double top, double radius, string fill,
            double opacity = 1, string? id = null, string? stroke = null, double strokeWidth = 0)
        {
            return new Dictionary<string, object?>
            {
                ["type"] = "circle",
                ["version"] = "5.3.0",
                ["originX"] = "left",
                ["originY"] = "top",
                ["left"] = left,
                ["top"] = top,
                ["radius"] = radius,
                ["fill"] = fill,
                ["stroke"] = stroke,
                ["strokeWidth"] = strokeWidth,
                ["scaleX"] = 1,
                ["scaleY"] = 1,
                ["opacity"] = opacity,
                ["selectable"] = true,
                ["hasControls"] = true,
                ["id"] = id
            };
        }

        public static Dictionary<string, object?> Triangle(double left, double top, double width, double height, string fill,
            double angle = 0, double opacity = 1, string? id = null)
        {
            return new Dictionary<string, object?>
            {
                ["type"] = "triangle",
                ["version"] = "5.3.0",
                ["originX"] = "left",
                ["originY"] = "top",
                ["left"] = left,
                ["top"] = top,
                ["width"] = width,
                ["height"] = height,
                ["fill"] = fill,
                ["scaleX"] = 1,
                ["scaleY"] = 1,
                ["opacity"] = opacity,
                ["angle"] = angle,
                ["selectable"] = true,
                ["hasControls"] = true,
                ["id"] = id
            };
        }

        public static Dictionary<string, object?> Text(string text, double left, double top, double width, int fontSize,
            string fill, int fontWeight = 400, string? fontFamily = null, string textAlign = "left",
            string? id = null, double lineHeight = 1.25)
        {
            return new Dictionary<string, object?>
            {
                ["type"] = "i-text",
                ["version"] = "5.3.0",
                ["originX"] = "left",
                ["originY"] = "top",
                ["left"] = left,
                ["top"] = top,
                ["width"] = width,
                ["fill"] = fill,
                ["stroke"] = null,
                ["strokeWidth"] = 1,
                ["scaleX"] = 1,
                ["scaleY"] = 1,
                ["opacity"] = 1,
                ["fontFamily"] = fontFamily ?? SansFont,
                ["fontSize"] = fontSize,
                ["fontWeight"] = fontWeight,
                ["fontStyle"] = "normal",
                ["text"] = text,
                ["textAlign"] = textAlign,
                ["lineHeight"] = lineHeight,
                ["charSpacing"] = 0,
                ["editable"] = true,
                ["selectable"] = true,
                ["hasControls"] = true,
                ["id"] = id
            };
        }

        // ---------- Icon library ----------
        // Each icon is a small list of Fabric primitives, positioned relative to (x, y) in a ~64x64 box.
        // User can still click each piece, but they read as a unified glyph.

        public static List<object> Icon(string key, double x, double y, string color, double size = 64)
        {
            double s = size / 64.0;
            return key switch
            {
                "target" => new List<object>
                {
                    Circle(x, y, 30 * s, color, opacity: 0.18),
                    Circle(x + 10 * s, y + 10 * s, 20 * s, color, opacity: 0.35),
                    Circle(x + 22 * s, y + 22 * s, 8 * s, color)
                },
                "rocket" => new List<object>
                {
                    Triangle(x + 16 * s, y, 32 * s, 44 * s, color),
                    Rect(x + 20 * s, y + 32 * s, 24 * s, 16 * s, color, opacity: 0.7, rx: 4, ry: 4),
                    Triangle(x + 4 * s, y + 36 * s, 16 * s, 20 * s, color, opacity: 0.5),
                    Triangle(x + 44 * s, y + 36 * s, 16 * s, 20 * s, color, opacity: 0.5, angle: 0)
                },
                "chart" => new List<object>
                {
                    Rect(x, y + 44 * s, 12 * s, 16 * s, color, opacity: 0.6),
                    Rect(x + 18 * s, y + 28 * s, 12 * s, 32 * s, color, opacity: 0.8),
                    Rect(x + 36 * s, y + 12 * s, 12 * s, 48 * s, color),
                    Rect(x, y + 60 * s, 60 * s, 2 * s, color, opacity: 0.4)
                },
                "doc" => new List<object>
                {
                    Rect(x + 8 * s, y, 48 * s, 60 * s, color, opacity: 0.15, rx: 4, ry: 4),
                    Rect(x + 16 * s, y + 14 * s, 32 * s, 4 * s, color),
                    Rect(x + 16 * s, y + 26 * s, 32 * s, 3 * s, color, opacity: 0.6),
                    Rect(x + 16 * s, y + 34 * s, 24 * s, 3 * s, color, opacity: 0.6),
                    Rect(x + 16 * s, y + 42 * s, 28 * s, 3 * s, color, opacity: 0.6)
                },
                "bulb" => new List<object>
                {
                    Circle(x + 16 * s, y, 16 * s, color, opacity: 0.25),
                    Circle(x + 20 * s, y + 4 * s, 10 * s, color),
                    Rect(x + 24 * s, y + 38 * s, 12 * s, 12 * s, color, opacity: 0.7, rx: 2, ry: 2),
                    Rect(x + 26 * s, y + 54 * s, 8 * s, 4 * s, color, opacity: 0.4)
                },
                "pin" => new List<object>
                {
                    Circle(x + 20 * s, y, 20 * s, color),
                    Triangle(x + 16 * s, y + 28 * s, 28 * s, 30 * s, color),
                    Circle(x + 26 * s, y + 12 * s, 6 * s, "#FFFFFF", opacity: 0.95)
                },
                "gear" => new List<object>
                {
                    Circle(x + 8 * s, y + 8 * s, 24 * s, color, opacity: 0.25),
                    Circle(x + 18 * s, y + 18 * s, 14 * s, color),
                    Circle(x + 26 * s, y + 26 * s, 6 * s, "#FFFFFF", opacity: 0.9)
                },
                "people" => new List<object>
                {
                    Circle(x + 4 * s, y + 6 * s, 12 * s, color, opacity: 0.6),
                    Rect(x, y + 28 * s, 32 * s, 20 * s, color, opacity: 0.6, rx: 8, ry: 8),
                    Circle(x + 28 * s, y + 2 * s, 14 * s, color),
                    Rect(x + 22 * s, y + 26 * s, 36 * s, 24 * s, color, rx: 8, ry: 8)
                },
                "shield" => new List<object>
                {
                    Rect(x + 8 * s, y, 40 * s, 36 * s, color, opacity: 0.25, rx: 6, ry: 6),
                    Triangle(x + 8 * s, y + 28 * s, 40 * s, 28 * s, color, opacity: 0.55),
                    Rect(x + 22 * s, y + 18 * s, 14 * s, 4 * s, "#FFFFFF", opacity: 0.95, rx: 2, ry: 2)
                },
                "spark" => new List<object>
                {
                    Triangle(x + 22 * s, y, 20 * s, 32 * s, color),
                    Triangle(x + 22 * s, y + 32 * s, 20 * s, 32 * s, color, angle: 180),
                    Triangle(x, y + 16 * s, 32 * s, 20 * s, color, opacity: 0.6, angle: 270),
                    Triangle(x + 32 * s, y + 16 * s, 32 * s, 20 * s, color, opacity: 0.6, angle: 90)
                },
                "calendar" => new List<object>
                {
                    Rect(x, y + 8 * s, 60 * s, 50 * s, color, opacity: 0.18, rx: 4, ry: 4),
                    Rect(x, y + 8 * s, 60 * s, 12 * s, color, rx: 4, ry: 4),
                    Rect(x + 12 * s, y + 30 * s, 8 * s, 8 * s, color, opacity: 0.7),
                    Rect(x + 26 * s, y + 30 * s, 8 * s, 8 * s, color, opacity: 0.7),
                    Rect(x + 40 * s, y + 30 * s, 8 * s, 8 * s, color, opacity: 0.7),
                    Rect(x + 12 * s, y + 44 * s, 8 * s, 8 * s, color, opacity: 0.4),
                    Rect(x + 26 * s, y + 44 * s, 8 * s, 8 * s, color, opacity: 0.4)
                },
                "check" => new List<object>
                {
                    Circle(x, y, 30 * s, color, opacity: 0.25),
                    Circle(x + 6 * s, y + 6 * s, 24 * s, color),
                    Rect(x + 18 * s, y + 28 * s, 12 * s, 4 * s, "#FFFFFF", angle: 45),
                    Rect(x + 26 * s, y + 22 * s, 22 * s, 4 * s, "#FFFFFF", angle: -45)
                },
                "money" => new List<object>
                {
                    Circle(x, y, 30 * s, color, opacity: 0.2),
                    Circle(x + 6 * s, y + 6 * s, 24 * s, color),
                    Rect(x + 24 * s, y + 12 * s, 4 * s, 36 * s, "#FFFFFF", opacity: 0.95)
                },
                "globe" => new List<object>
                {
                    Circle(x, y, 30 * s, color, opacity: 0.25),
                    Circle(x + 4 * s, y + 4 * s, 26 * s, color, opacity: 0.6),
                    Rect(x + 4 * s, y + 28 * s, 52 * s, 2 * s, "#FFFFFF", opacity: 0.85),
                    Rect(x + 28 * s, y + 4 * s, 2 * s, 52 * s, "#FFFFFF", opacity: 0.85)
                },
                "code" => new List<object>
                {
                    Rect(x, y + 10 * s, 60 * s, 44 * s, color, opacity: 0.2, rx: 4, ry: 4),
                    Triangle(x + 14 * s, y + 22 * s, 12 * s, 16 * s, color, angle: 270),
                    Triangle(x + 38 * s, y + 22 * s, 12 * s, 16 * s, color, angle: 90),
                    Rect(x + 24 * s, y + 22 * s, 12 * s, 4 * s, color, angle: 60)
                },
                "leaf" => new List<object>
                {
                    Triangle(x + 8 * s, y, 40 * s, 56 * s, color),
                    Rect(x + 26 * s, y + 16 * s, 4 * s, 32 * s, "#FFFFFF", opacity: 0.5)
                },
                "camera" => new List<object>
                {
                    Rect(x, y + 12 * s, 60 * s, 40 * s, color, opacity: 0.25, rx: 6, ry: 6),
                    Rect(x + 20 * s, y + 4 * s, 20 * s, 12 * s, color, opacity: 0.6, rx: 2, ry: 2),
                    Circle(x + 20 * s, y + 18 * s, 14 * s, color),
                    Circle(x + 28 * s, y + 26 * s, 6 * s, "#FFFFFF", opacity: 0.9)
                },
                "heart" => new List<object>
                {
                    Circle(x, y + 8 * s, 16 * s, color),
                    Circle(x + 32 * s, y + 8 * s, 16 * s, color),
                    Triangle(x + 4 * s, y + 16 * s, 56 * s, 44 * s, color, angle: 180)
                },
                "mail" => new List<object>
                {
                    Rect(x, y + 8 * s, 60 * s, 44 * s, color, opacity: 0.2, rx: 4, ry: 4),
                    Triangle(x, y + 8 * s, 60 * s, 32 * s, color, opacity: 0.55)
                },
                "phone" => new List<object>
                {
                    Rect(x + 12 * s, y, 36 * s, 60 * s, color, opacity: 0.2, rx: 6, ry: 6),
                    Rect(x + 16 * s, y + 8 * s, 28 * s, 40 * s, color, opacity: 0.5, rx: 2, ry: 2),
                    Circle(x + 26 * s, y + 50 * s, 4 * s, "#FFFFFF", opacity: 0.9)
                },
                _ => new List<object>
                {
                    Circle(x + 8 * s, y + 8 * s, 24 * s, color)
                }
            };
        }
    }
}
