import json
import random
import urllib.request
from pathlib import Path

ASSET_DIR = Path("DoAnLtWeb/wwwroot/uploads/template-assets")
ASSET_DIR.mkdir(parents=True, exist_ok=True)

ASSET_TOPICS = ["business", "classroom", "technology", "marketing", "vietnam", "travel", "team", "data", "coffee", "student", "office", "culture"]

def ensure_assets():
    assets = []
    for i in range(72):
        topic = ASSET_TOPICS[i % len(ASSET_TOPICS)]
        file = ASSET_DIR / f"{topic}-{i:02d}.jpg"
        if not file.exists() or file.stat().st_size < 1000:
            url = f"https://picsum.photos/seed/slidify-{topic}-{i}/900/600"
            try:
                urllib.request.urlretrieve(url, file)
            except Exception:
                pass
        if file.exists() and file.stat().st_size > 1000:
            assets.append("/uploads/template-assets/" + file.name)
    return assets

ASSETS = ensure_assets()

CANVAS_W = 800
CANVAS_H = 450

CATEGORIES = [
    ("Báo cáo", ["#0f172a", "#2563eb", "#38bdf8", "#e0f2fe"]),
    ("Môn học", ["#064e3b", "#16a34a", "#facc15", "#f7fee7"]),
    ("Bài giảng", ["#1e1b4b", "#7c3aed", "#a78bfa", "#f5f3ff"]),
    ("Quảng cáo", ["#111827", "#f97316", "#ec4899", "#fff7ed"]),
    ("Dự án", ["#0c4a6e", "#14b8a6", "#22d3ee", "#ecfeff"]),
    ("Việt Nam", ["#7f1d1d", "#dc2626", "#facc15", "#fff7ed"]),
]

TOPICS = {
    "Báo cáo": ["Báo cáo thực tập doanh nghiệp", "Báo cáo đồ án tốt nghiệp", "Báo cáo nghiên cứu khoa học", "Báo cáo kết quả kinh doanh", "Báo cáo tiến độ dự án", "Báo cáo phân tích thị trường", "Báo cáo tài chính cơ bản", "Báo cáo tổng kết học kỳ"],
    "Môn học": ["Thuyết trình môn Kinh tế vi mô", "Thuyết trình môn Marketing căn bản", "Thuyết trình môn Lập trình Web", "Thuyết trình môn Cơ sở dữ liệu", "Thuyết trình môn Quản trị học", "Thuyết trình môn Tư tưởng Hồ Chí Minh", "Thuyết trình môn Pháp luật đại cương", "Thuyết trình môn Kỹ năng mềm"],
    "Bài giảng": ["Slide bài giảng Toán ứng dụng", "Slide bài giảng Tin học văn phòng", "Slide bài giảng Tiếng Anh giao tiếp", "Slide bài giảng Lịch sử Việt Nam", "Slide bài giảng Địa lý Việt Nam", "Slide bài giảng Sinh học cơ bản", "Slide bài giảng Vật lý đại cương", "Slide bài giảng Kỹ năng thuyết trình"],
    "Quảng cáo": ["Slide quảng cáo sản phẩm mới", "Pitch deck startup Việt Nam", "Kế hoạch truyền thông mạng xã hội", "Proposal quảng cáo thương hiệu", "Chiến dịch ra mắt quán cà phê", "Quảng cáo khóa học online", "Quảng cáo du lịch địa phương", "Giới thiệu dịch vụ doanh nghiệp"],
    "Dự án": ["Kế hoạch dự án phần mềm", "Đề xuất website bán hàng", "Dự án cộng đồng sinh viên", "Dự án bảo vệ môi trường", "Dự án chuyển đổi số", "Roadmap phát triển ứng dụng", "Kế hoạch tổ chức sự kiện", "Dự án nghiên cứu người dùng"],
    "Việt Nam": ["Du lịch Việt Nam ba miền", "Văn hóa ẩm thực Việt Nam", "Di sản văn hóa Việt Nam", "Lễ hội truyền thống Việt Nam", "Địa danh nổi tiếng Việt Nam", "Lịch sử Việt Nam hiện đại", "Kinh tế Việt Nam hiện nay", "Khởi nghiệp tại Việt Nam"],
}


PALETTE_POOL = [
    ["#0f172a", "#2563eb", "#38bdf8", "#e0f2fe"], ["#111827", "#f97316", "#ec4899", "#fff7ed"],
    ["#064e3b", "#16a34a", "#facc15", "#f7fee7"], ["#312e81", "#7c3aed", "#f472b6", "#faf5ff"],
    ["#7f1d1d", "#dc2626", "#facc15", "#fff7ed"], ["#0c4a6e", "#14b8a6", "#22d3ee", "#ecfeff"],
    ["#18181b", "#52525b", "#f4f4f5", "#fafafa"], ["#3f1d09", "#b45309", "#fbbf24", "#fffbeb"],
    ["#022c22", "#059669", "#84cc16", "#ecfccb"], ["#1e293b", "#64748b", "#cbd5e1", "#f8fafc"],
]

slide_kinds = ["cover", "agenda", "section", "two_col", "cards", "timeline", "table", "chart", "image_grid", "quote", "team", "closing"]


def obj_id(prefix):
    obj_id.counter += 1
    return f"{prefix}{obj_id.counter:05d}"
obj_id.counter = 0


def base_obj(kind, left, top, width=None, height=None, **kwargs):
    o = {
        "type": kind,
        "version": "5.3.0",
        "left": round(left, 1),
        "top": round(top, 1),
        "selectable": True,
        "editable": kind in ("textbox", "i-text", "text"),
        "transparentCorners": False,
        "id": obj_id(kind[:2]),
    }
    if width is not None: o["width"] = round(width, 1)
    if height is not None: o["height"] = round(height, 1)
    o.update(kwargs)
    return o


def text(txt, left, top, size=24, color="#ffffff", width=300, weight="normal", align="left"):
    return base_obj("textbox", left, top, width, None, text=txt, fontSize=size, fill=color, fontFamily="Inter", fontWeight=weight, textAlign=align, lineHeight=1.12, name="Văn bản")


def rect(left, top, width, height, fill, stroke="", radius=0, opacity=1):
    o = base_obj("rect", left, top, width, height, fill=fill, opacity=opacity, rx=radius, ry=radius, name="Khung")
    if stroke:
        o["stroke"] = stroke; o["strokeWidth"] = 1.5
    return o


def circle(left, top, diameter, fill, opacity=1):
    return base_obj("circle", left, top, diameter, diameter, radius=diameter/2, fill=fill, opacity=opacity, name="Hình tròn")


def line(x1, y1, x2, y2, color="#ffffff", width=2):
    return base_obj("line", x1, y1, None, None, x1=0, y1=0, x2=x2-x1, y2=y2-y1, stroke=color, strokeWidth=width, name="Đường kẻ")


def next_asset():
    if not ASSETS:
        return ""
    next_asset.index = (next_asset.index + 1) % len(ASSETS)
    return ASSETS[next_asset.index]
next_asset.index = -1


def image_obj(left, top, width, height, src, name="?nh"):
    if not src:
        return rect(left, top, width, height, "#e2e8f0", "rgba(255,255,255,0.55)", 18)
    return base_obj("image", left, top, width, height, src=src, crossOrigin="anonymous", scaleX=1.0, scaleY=1.0, name=name)


def image_box(left, top, width, height, fill="#e2e8f0", label="?nh"):
    src = next_asset()
    return [
        image_obj(left, top, width, height, src, label),
        rect(left, top, width, height, "rgba(0,0,0,0.08)", "rgba(255,255,255,0.35)", 18),
    ]


def bg_objects(palette, variant):
    dark, accent, accent2, light = palette
    objs = [rect(0, 0, CANVAS_W, CANVAS_H, dark)]
    if variant % 3 == 0:
        objs += [circle(-80, -80, 260, accent, .35), circle(610, 245, 260, accent2, .32), rect(0, 390, 800, 60, "rgba(255,255,255,0.08)")]
    elif variant % 3 == 1:
        objs += [rect(0, 0, 300, 450, accent, opacity=.18), circle(540, -120, 340, accent2, .22), line(60, 380, 740, 380, "rgba(255,255,255,0.25)", 1.5)]
    else:
        objs += [rect(42, 34, 716, 382, "rgba(255,255,255,0.06)", "rgba(255,255,255,0.16)", 26), circle(690, 42, 90, accent, .22)]
    return objs


def make_slide(kind, title, category, palette, idx, total):
    dark, accent, accent2, light = palette
    objs = bg_objects(palette, idx)
    footer = [text(f"{idx:02d} / {total:02d}", 690, 402, 14, "rgba(255,255,255,0.72)", 70, "700", "right")]

    if kind == "cover":
        objs += [text(category.upper(), 60, 52, 15, accent2, 360, "800"), text(title, 60, 112, 54, "#ffffff", 520, "800"), text("Thay nội dung theo bài thuyết trình của bạn", 64, 275, 22, "rgba(255,255,255,0.78)", 430), *image_box(555, 72, 180, 260, light, "Ảnh chính")]
    elif kind == "agenda":
        objs += [text("Chương trình", 60, 48, 44, "#ffffff", 420, "800")]
        for i, item in enumerate(["Tổng quan", "Vấn đề", "Giải pháp", "Lộ trình", "Kết quả", "Hỏi đáp"]):
            x = 92 + (i % 2) * 330; y = 130 + (i // 2) * 76
            objs += [text(f"0{i+1}", x, y, 15, accent2, 45, "800"), text(item, x+54, y-4, 25, "#ffffff", 220, "700")]
    elif kind == "section":
        objs += [rect(58, 72, 90, 8, accent2, radius=4), text(title.split()[0] if title.split() else "Phần", 58, 118, 66, "#ffffff", 560, "800"), text("Một thông điệp ngắn để dẫn vào phần tiếp theo", 62, 275, 24, "rgba(255,255,255,0.78)", 520)]
    elif kind == "two_col":
        objs += [text("Nội dung chính", 56, 42, 38, "#ffffff", 360, "800"), *image_box(475, 82, 250, 265, light, "Ảnh minh họa")]
        for i in range(3):
            objs += [circle(68, 122+i*78, 28, accent2), text(["Ý chính thứ nhất", "Ý chính thứ hai", "Ý chính thứ ba"][i], 112, 118+i*78, 24, "#ffffff", 300, "700"), text("Mô tả ngắn, có thể sửa trực tiếp.", 112, 150+i*78, 16, "rgba(255,255,255,0.68)", 300)]
    elif kind == "cards":
        objs += [text("Ba điểm nổi bật", 56, 42, 38, "#ffffff", 450, "800")]
        for i in range(3):
            objs += [rect(58+i*238, 128, 200, 200, "rgba(255,255,255,0.10)", "rgba(255,255,255,0.22)", 20), text(f"0{i+1}", 80+i*238, 150, 18, accent2, 60, "800"), text(["Tốc độ", "Hiệu quả", "Tăng trưởng"][i], 80+i*238, 190, 26, "#ffffff", 156, "800"), text("Thêm mô tả ngắn cho thẻ này.", 80+i*238, 238, 16, "rgba(255,255,255,0.68)", 150)]
    elif kind == "timeline":
        objs += [text("Lộ trình", 56, 42, 40, "#ffffff", 300, "800"), line(92, 225, 710, 225, "rgba(255,255,255,0.45)", 3)]
        for i in range(4):
            x = 100+i*155
            objs += [circle(x, 211, 28, accent2), text(f"Q{i+1}", x-8, 170, 16, "#ffffff", 55, "800"), text("Mốc quan trọng", x-32, 252, 18, "#ffffff", 120, "700")]
    elif kind == "table":
        objs += [text("Bảng thông tin", 56, 42, 38, "#ffffff", 420, "800"), rect(58, 118, 680, 230, "rgba(255,255,255,0.09)", "rgba(255,255,255,0.25)", 14)]
        for r in range(4):
            objs += [line(58, 166+r*48, 738, 166+r*48, "rgba(255,255,255,0.20)", 1)]
        for c in range(1,4): objs += [line(58+c*170, 118, 58+c*170, 348, "rgba(255,255,255,0.18)", 1)]
        for c, h in enumerate(["Hạng mục", "Mục tiêu", "Tiến độ", "Ghi chú"]): objs += [text(h, 72+c*170, 132, 16, accent2, 130, "800")]
        for r in range(3):
            for c in range(4): objs += [text("Sửa nội dung", 72+c*170, 184+r*48, 15, "rgba(255,255,255,0.78)", 130)]
    elif kind == "chart":
        objs += [text("Biểu đồ", 56, 42, 38, "#ffffff", 300, "800"), line(95, 340, 650, 340, "rgba(255,255,255,0.35)", 2), line(95, 120, 95, 340, "rgba(255,255,255,0.35)", 2)]
        vals = [150, 105, 178, 132, 205]
        for i,v in enumerate(vals):
            objs += [rect(135+i*88, 340-v, 46, v, accent if i%2 else accent2, radius=8), text(f"M{i+1}", 132+i*88, 355, 15, "#ffffff", 55, "700", "center")]
    elif kind == "image_grid":
        objs += [text("Thư viện hình ảnh", 56, 42, 38, "#ffffff", 430, "800")]
        for i in range(4): objs += image_box(70+(i%2)*250, 118+(i//2)*125, 210, 100, light, f"Ảnh {i+1}")
        objs += [text("Ghi chú hoặc caption ảnh", 590, 150, 22, "#ffffff", 150, "700"), text("Tất cả khung đều có thể kéo, resize và thay nội dung.", 590, 205, 16, "rgba(255,255,255,0.7)", 150)]
    elif kind == "quote":
        objs += [text("“", 70, 54, 92, accent2, 90, "800"), text("Một câu trích dẫn mạnh giúp nhấn thông điệp chính của bài trình bày.", 135, 120, 38, "#ffffff", 530, "800"), text("— Tên người phát biểu", 138, 318, 20, "rgba(255,255,255,0.72)", 330, "700")]
    elif kind == "team":
        objs += [text("Đội ngũ", 56, 42, 38, "#ffffff", 300, "800")]
        for i in range(4):
            x = 70+i*175
            objs += [circle(x+34, 130, 76, light), text("Tên thành viên", x, 222, 18, "#ffffff", 145, "800", "center"), text("Vai trò", x, 252, 15, "rgba(255,255,255,0.66)", 145, "center")]
    else:
        objs += [text("Cảm ơn", 60, 95, 64, "#ffffff", 420, "800"), text("Thêm thông tin liên hệ hoặc lời kêu gọi hành động.", 64, 210, 24, "rgba(255,255,255,0.76)", 430), rect(62, 315, 210, 52, accent2, radius=26), text("Liên hệ ngay", 98, 331, 18, dark, 150, "800", "center")]

    objs += footer
    return {
        "PageNumber": idx,
        "BackgroundColor": dark,
        "BackgroundImage": "",
        "ElementsJson": json.dumps({"version":"5.3.0", "canvasWidth": CANVAS_W, "canvasHeight": CANVAS_H, "objects": objs}, ensure_ascii=False)
    }


def make_template(n, category, palette, topic):
    palette = PALETTE_POOL[(n - 1) % len(PALETTE_POOL)]
    count = 7 + (n % 12)
    if n % 4 == 0:
        kinds = ["cover", "image_grid", "section", "cards", "table", "timeline", "quote"]
    elif n % 4 == 1:
        kinds = ["cover", "agenda", "two_col", "chart", "cards", "team", "closing"]
    elif n % 4 == 2:
        kinds = ["cover", "section", "table", "image_grid", "timeline", "chart", "closing"]
    else:
        kinds = ["cover", "quote", "cards", "two_col", "team", "table", "closing"]
    while len(kinds) < count:
        kinds.insert(-1, slide_kinds[(n + len(kinds)) % len(slide_kinds)])
    kinds = kinds[:count-1] + ["closing"]
    slides = [make_slide(k, topic, category, palette, i+1, count) for i,k in enumerate(kinds)]
    return {
        "Title": f"{topic} #{n:02d}",
        "Category": category,
        "ThumbnailUrl": "",
        "Slides": slides
    }


def build_payload():
    templates = []
    n = 1
    for category, palette in CATEGORIES:
        for topic in TOPICS[category]:
            templates.append(make_template(n, category, palette, topic))
            n += 1
    templates.append(make_template(n, "Doanh nghiệp", CATEGORIES[0][1], "Bản trình bày tối giản")); n += 1
    templates.append(make_template(n, "Công nghệ", CATEGORIES[2][1], "Dashboard dữ liệu"))
    return {"Templates": templates[:50]}

payload = build_payload()
out = Path("DoAnLtWeb/wwwroot/generated-native-templates.json")
out.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
print(f"Generated {len(payload['Templates'])} templates -> {out}")

url = "https://localhost:7272/Slide/SaveSeededTemplates"
data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
try:
    import ssl
    ctx = ssl._create_unverified_context()
    with urllib.request.urlopen(req, context=ctx, timeout=120) as resp:
        print(resp.status, resp.read().decode("utf-8", errors="replace"))
except Exception as exc:
    print(f"POST skipped/failed: {exc}")
    print("Run again while https://localhost:7272 is open to import into DB.")
