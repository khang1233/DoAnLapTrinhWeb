using System.Collections.Generic;
using System.Linq;

namespace DoAnLtWeb.Data
{
    // Per-topic data pool. Each TopicPack provides enough material for a 30-slide deck
    // without repeating itself in a jarring way.
    public record DeckSpec(
        string Title,
        string Subtitle,
        string FooterTag,
        string IconKey,
        List<string> LayoutOrder
    );

    public record TopicPack(
        string TopicKey,
        List<DeckSpec> Decks,
        List<string> Kickers,
        List<string> Bullets,
        List<string> Descriptions,
        List<(string Stat, string Label)> Stats,
        List<(string Step, string Title, string Desc)> Steps,
        List<(string Name, string Role, string Bio)> People,
        List<(string C1, string C2, string C3, string C4)> Rows,
        List<string> Quotes,
        List<(string Author, string Role)> Authors,
        List<string> Icons,
        List<string> AgendaHeads,
        List<string> AgendaDescs
    );

    public static class ContentLibrary
    {
        // 18 layouts available. Each deck spec lists which to use — first MUST be a cover,
        // last MUST be "closing", and we sprinkle a "section-divider" every 5-6 slides.
        // Length comes from this list's Count → 9..30 slides.

        // NOTE: keep LayoutPatterns declared BEFORE Packs — Packs initializer calls
        // BuildXxx() which reads LayoutPatterns. Static field init runs in textual order
        // and accessing a not-yet-initialised array returns null → NullReferenceException.
        private static readonly List<string>[] LayoutPatterns =
        {
            // 9
            new() { "cover-side", "agenda", "bullets-3", "stats-3", "two-column", "timeline-4", "quote", "team-3", "closing" },
            // 11
            new() { "cover-centered", "section-divider", "bullets-4", "two-column", "icon-grid", "stats-4", "process-steps", "table", "quote", "team-3", "closing" },
            // 13
            new() { "cover-split", "agenda", "bullets-3", "image-text", "two-column", "stats-3", "section-divider", "timeline-4", "chart-bars", "icon-grid", "quote", "team-3", "closing" },
            // 15
            new() { "cover-side", "section-divider", "agenda", "bullets-4", "two-column", "stats-4", "process-steps", "image-text", "section-divider", "timeline-4", "chart-bars", "table", "faq", "quote", "closing" },
            // 18
            new() { "cover-centered", "agenda", "section-divider", "bullets-3", "two-column", "image-text", "stats-3", "process-steps", "section-divider", "icon-grid", "timeline-4", "chart-bars", "table", "pricing-3", "team-3", "faq", "quote", "closing" },
            // 22
            new() { "cover-split", "agenda", "section-divider", "bullets-3", "bullets-4", "two-column", "icon-grid", "stats-3", "image-text", "section-divider", "process-steps", "timeline-4", "chart-bars", "stats-4", "table", "two-column", "section-divider", "pricing-3", "team-3", "faq", "quote", "closing" },
            // 26
            new() { "cover-side", "agenda", "section-divider", "bullets-3", "image-text", "two-column", "icon-grid", "stats-4", "process-steps", "section-divider", "timeline-4", "two-column", "chart-bars", "stats-3", "table", "image-text", "section-divider", "icon-grid", "bullets-4", "pricing-3", "team-3", "faq", "quote", "stats-3", "two-column", "closing" },
            // 30
            new() { "cover-centered", "agenda", "section-divider", "bullets-3", "two-column", "image-text", "stats-3", "icon-grid", "process-steps", "section-divider", "timeline-4", "chart-bars", "stats-4", "two-column", "image-text", "section-divider", "icon-grid", "table", "bullets-4", "pricing-3", "process-steps", "section-divider", "team-3", "stats-3", "two-column", "faq", "quote", "chart-bars", "image-text", "closing" }
        };

        public static List<string> PatternForLength(int idx) => LayoutPatterns[idx % LayoutPatterns.Length];

        public static readonly Dictionary<string, TopicPack> Packs = new()
        {
            ["kinhdoanh"] = BuildBusiness(),
            ["giaoduc"] = BuildEducation(),
            ["marketing"] = BuildMarketing(),
            ["congnghe"] = BuildTech(),
            ["khoinghiep"] = BuildStartup(),
            ["sangtao"] = BuildCreative(),
            ["sukien"] = BuildEvent()
        };

        // ---------- Helper builders ----------
        private static List<DeckSpec> MakeDecks(IEnumerable<(string T, string S, string F, string Ico)> seeds)
        {
            var list = seeds.ToList();
            var result = new List<DeckSpec>();
            for (int i = 0; i < list.Count; i++)
            {
                result.Add(new DeckSpec(list[i].T, list[i].S, list[i].F, list[i].Ico,
                    LayoutPatterns[i % LayoutPatterns.Length]));
            }
            return result;
        }

        // ---------- Topic packs ----------

        private static TopicPack BuildBusiness() => new(
            "kinhdoanh",
            MakeDecks(new (string, string, string, string)[]
            {
                ("Chiến lược doanh nghiệp 2026", "Lộ trình tăng trưởng bền vững", "STRATEGY · 2026", "target"),
                ("Báo cáo kết quả kinh doanh quý", "Tổng kết Q1 và dự báo Q2", "QUARTERLY REPORT", "chart"),
                ("Đề xuất hợp tác chiến lược", "Cùng mở rộng thị trường khu vực", "PARTNERSHIP", "people"),
                ("Kế hoạch bán hàng năm 2026", "Mục tiêu doanh số và phân phối", "SALES PLAN", "rocket"),
                ("Tái cấu trúc vận hành", "Tinh gọn để tăng biên lợi nhuận", "OPERATIONS", "gear"),
                ("Mở rộng thị trường miền Trung", "Đánh giá cơ hội và rủi ro", "EXPANSION", "globe"),
                ("Quản trị rủi ro doanh nghiệp", "Khung ERM cho ban điều hành", "RISK MGMT", "shield"),
                ("Đánh giá đối thủ cạnh tranh", "Phân tích SWOT chuyên sâu", "COMPETITIVE", "spark")
            }),
            Kickers: new() { "CHIẾN LƯỢC", "BỐI CẢNH", "ĐỀ XUẤT", "KẾT QUẢ", "ROI", "RỦI RO", "HÀNH ĐỘNG", "NGÂN SÁCH", "LỘ TRÌNH" },
            Bullets: new()
            {
                "Tăng trưởng doanh thu", "Mở rộng thị phần", "Tối ưu chi phí",
                "Nâng cao năng suất", "Chuyển đổi số", "Giữ chân khách hàng",
                "Đa dạng hoá sản phẩm", "Mở rộng kênh phân phối", "Tăng biên lợi nhuận",
                "Tự động hoá quy trình", "Đầu tư công nghệ", "Phát triển đội ngũ"
            },
            Descriptions: new()
            {
                "Đạt mức tăng trưởng hai con số nhờ kết hợp kênh truyền thống và số hoá.",
                "Mở rộng độ phủ tại 5 tỉnh thành chủ chốt trong 12 tháng tới.",
                "Cắt giảm 12% chi phí vận hành thông qua tự động hoá quy trình lõi.",
                "Tăng năng suất nhân sự tuyến đầu nhờ công cụ phân tích thời gian thực.",
                "Triển khai nền tảng dữ liệu chung phục vụ ra quyết định.",
                "Tỉ lệ giữ chân khách hàng tăng 8 điểm nhờ chương trình thành viên mới.",
                "Ra mắt 3 dòng sản phẩm mới phục vụ phân khúc cao cấp.",
                "Hợp tác chiến lược với 4 nhà bán lẻ quy mô vùng.",
                "Biên lợi nhuận gộp dự kiến đạt 32% nhờ tối ưu chuỗi cung ứng."
            },
            Stats: new()
            {
                ("+18%", "Doanh thu lõi"), ("62", "NPS khách hàng"), ("−12%", "Chi phí vận hành"),
                ("4.8/5", "Mức độ gắn kết"), ("99,9%", "Tỉ lệ giao hàng đúng hạn"), ("32%", "Biên lợi nhuận gộp"),
                ("8,5M", "Khách hàng tiếp cận"), ("450", "Đối tác chiến lược"), ("12", "Thị trường mới")
            },
            Steps: new()
            {
                ("Q1", "Chẩn đoán", "Đánh giá hiện trạng và mục tiêu."),
                ("Q2", "Thiết kế", "Phác thảo mô hình mới."),
                ("Q3", "Triển khai", "Áp dụng tại 3 đơn vị thí điểm."),
                ("Q4", "Nhân rộng", "Mở rộng toàn công ty."),
                ("01", "Khảo sát", "Lắng nghe khách hàng và nhân sự."),
                ("02", "Thiết kế lại", "Dựng mô hình vận hành mới."),
                ("03", "Đào tạo", "Trang bị kỹ năng cho tuyến đầu."),
                ("04", "Đo lường", "Theo dõi chỉ số then chốt."),
                ("05", "Cải tiến", "Lặp lại theo phản hồi thực tế.")
            },
            People: new()
            {
                ("Trần Hà", "CEO", "12 năm điều hành doanh nghiệp tiêu dùng."),
                ("Nguyễn Quân", "CFO", "Cựu giám đốc tài chính tập đoàn niêm yết."),
                ("Lê Mai", "COO", "Chuyên gia vận hành chuỗi giá trị."),
                ("Phạm Linh", "CMO", "Dẫn dắt thương hiệu cho 3 startup tăng trưởng."),
                ("Đặng Sơn", "CTO", "20 năm kiến trúc hệ thống doanh nghiệp.")
            },
            Rows: new()
            {
                ("Doanh thu", "182,4 tỷ", "204,1 tỷ", "+11,9%"),
                ("Lợi nhuận gộp", "69,7 tỷ", "82,8 tỷ", "+18,8%"),
                ("Chi phí vận hành", "44,2 tỷ", "39,0 tỷ", "−11,8%"),
                ("Khách hàng mới", "12 400", "18 700", "+50,8%"),
                ("Khách giữ chân", "73%", "81%", "+8 điểm")
            },
            Quotes: new()
            {
                "Khách hàng không trả tiền cho công nghệ — họ trả tiền cho kết quả mà công nghệ tạo ra.",
                "Tốc độ ra quyết định quan trọng hơn sự hoàn hảo của quyết định đó.",
                "Chiến lược chỉ thành chiến lược khi nó nói rõ điều ta sẽ KHÔNG làm."
            },
            Authors: new() { ("PETER DRUCKER", "Quản trị học hiện đại"), ("REID HOFFMAN", "Nhà sáng lập LinkedIn"), ("MICHAEL PORTER", "Giáo sư Harvard") },
            Icons: new() { "target", "chart", "rocket", "shield", "people", "globe", "spark", "gear" },
            AgendaHeads: new() { "Bối cảnh thị trường", "Mục tiêu chiến lược", "Kế hoạch triển khai", "Ngân sách & nhân lực", "Rủi ro & biện pháp", "Cam kết và lộ trình" },
            AgendaDescs: new() { "Áp lực cạnh tranh và cơ hội mới.", "Bốn trụ cột cho 24 tháng tới.", "Lộ trình quý và chỉ số then chốt.", "Phân bổ vốn và đội ngũ.", "Kịch bản và hành động giảm thiểu.", "Cột mốc kiểm điểm hàng quý." }
        );

        private static TopicPack BuildEducation() => new(
            "giaoduc",
            MakeDecks(new (string, string, string, string)[]
            {
                ("Bài giảng · Lớp đảo ngược", "Phương pháp học chủ động", "BÀI GIẢNG · 03", "bulb"),
                ("Đồ án tốt nghiệp ngành CNTT", "Ứng dụng AI trong giáo dục", "ĐỒ ÁN · 2026", "doc"),
                ("Luận văn thạc sĩ", "Nghiên cứu hành vi học tập số", "LUẬN VĂN", "doc"),
                ("Báo cáo seminar khoa học", "Mô hình ngôn ngữ và giáo dục", "SEMINAR", "code"),
                ("Giới thiệu khoá học mới", "Chương trình 12 tuần cho người mới", "COURSE", "calendar"),
                ("Kế hoạch nghiên cứu sinh", "Đề cương 3 năm tiến sĩ", "PHD PLAN", "doc"),
                ("Workshop kỹ năng viết", "Học viết học thuật từ căn bản", "WORKSHOP", "bulb"),
                ("Tổng kết năm học", "Báo cáo cho hội đồng trường", "ANNUAL", "check")
            }),
            Kickers: new() { "BÀI GIẢNG", "MỤC TIÊU", "PHƯƠNG PHÁP", "TÀI LIỆU", "ĐÁNH GIÁ", "THẢO LUẬN", "VÍ DỤ", "BÀI TẬP" },
            Bullets: new()
            {
                "Hiểu khái niệm cốt lõi", "Áp dụng vào bài tập", "Phản tỉnh và cải tiến",
                "Đọc tài liệu trước lớp", "Thảo luận nhóm tích cực", "Trình bày kết quả ngắn gọn",
                "Sử dụng công cụ trực quan", "Đặt câu hỏi mở", "Kết nối với thực tế",
                "Tự đánh giá học tập", "Học cùng bạn", "Phản hồi từ giảng viên"
            },
            Descriptions: new()
            {
                "Sinh viên xem video bài giảng ở nhà và làm bài tập trên lớp với hỗ trợ trực tiếp.",
                "Mỗi nhóm 4–5 người, luân phiên vai trò người dẫn, người ghi và người phản biện.",
                "Phiếu phản tỉnh cuối giờ ghi lại điều đã hiểu và điều còn vướng mắc.",
                "Bài kiểm tra ngắn 5 phút đầu giờ giúp giảng viên điều chỉnh nội dung.",
                "Sử dụng bản đồ khái niệm để liên kết các ý tưởng quan trọng.",
                "Hoạt động học qua dạy bạn: mỗi sinh viên giảng lại một mục cho nhóm 3.",
                "Tranh luận có tổ chức giữa hai nhóm bảo vệ hai quan điểm đối lập.",
                "Đánh giá đa chiều: tự đánh giá, đánh giá ngang hàng, đánh giá giảng viên.",
                "Liên hệ kiến thức với tình huống thực tế trong nghề nghiệp tương lai."
            },
            Stats: new()
            {
                ("89%", "Sinh viên tham gia"), ("4.7/5", "Đánh giá khoá học"), ("+24%", "Điểm bài kiểm tra"),
                ("12", "Hoạt động/tuần"), ("3", "Bài tập lớn"), ("45h", "Thực hành"),
                ("210", "Sinh viên ghi danh"), ("96%", "Tỉ lệ hoàn thành"), ("8.2", "Điểm trung bình")
            },
            Steps: new()
            {
                ("T1", "Khởi động", "Giới thiệu mục tiêu và kỳ vọng."),
                ("T2", "Khám phá", "Đọc tài liệu và xem video."),
                ("T3", "Thực hành", "Làm bài tập tại lớp."),
                ("T4", "Đánh giá", "Phản tỉnh và phản hồi."),
                ("01", "Đặt câu hỏi", "Khơi gợi tò mò của người học."),
                ("02", "Khám phá", "Tìm hiểu thông qua hoạt động."),
                ("03", "Giải thích", "Hệ thống hoá kiến thức."),
                ("04", "Mở rộng", "Áp dụng vào tình huống mới."),
                ("05", "Đánh giá", "Đo lường mức độ hiểu bài.")
            },
            People: new()
            {
                ("TS. Nguyễn Minh Anh", "Giảng viên chính", "Nghiên cứu phương pháp giảng dạy hiện đại."),
                ("ThS. Trần Quốc Bảo", "Giảng viên trợ giảng", "Chuyên về thiết kế bài giảng số."),
                ("Lê Thị Hương", "Nghiên cứu sinh", "Phân tích hành vi học tập trực tuyến."),
                ("PGS. Phạm Đức", "Cố vấn học thuật", "30 năm trong lĩnh vực giáo dục đại học.")
            },
            Rows: new()
            {
                ("Tiêu chí", "Yếu", "Đạt", "Xuất sắc"),
                ("Tham gia thảo luận", "Im lặng cả buổi", "Đóng góp 1–2 lần", "Dẫn dắt thảo luận"),
                ("Chất lượng câu hỏi", "Lặp lại tài liệu", "Đặt câu hỏi mở", "Đào sâu, liên hệ"),
                ("Bài phản tỉnh", "Bỏ trống", "Tóm tắt nội dung", "Phân tích nhận thức"),
                ("Hợp tác nhóm", "Làm việc một mình", "Chia sẻ vai trò", "Hỗ trợ bạn yếu hơn")
            },
            Quotes: new()
            {
                "Giáo dục không phải đổ đầy một cái thùng, mà là thắp lên một ngọn lửa.",
                "Người học chủ động học gấp ba lần người chỉ ngồi nghe.",
                "Câu hỏi đúng quan trọng hơn câu trả lời đúng."
            },
            Authors: new() { ("W. B. YEATS", "Nhà thơ"), ("JOHN DEWEY", "Triết gia giáo dục"), ("PAULO FREIRE", "Nhà sư phạm") },
            Icons: new() { "bulb", "doc", "people", "check", "calendar", "spark", "code" },
            AgendaHeads: new() { "Khái niệm cốt lõi", "Phương pháp tiếp cận", "Hoạt động trên lớp", "Tài liệu tham khảo", "Đánh giá kết quả", "Bài tập về nhà" },
            AgendaDescs: new() { "Hiểu nền tảng lý thuyết.", "Cách áp dụng vào lớp học.", "Năm kỹ thuật học chủ động.", "Sách, bài báo, video.", "Tiêu chí và quy trình.", "Chuẩn bị cho buổi sau." }
        );

        private static TopicPack BuildMarketing() => new(
            "marketing",
            MakeDecks(new (string, string, string, string)[]
            {
                ("Chiến dịch mùa hè 2026", "Đặt lại nhịp cho mùa hè rực rỡ", "SUMMER CAMPAIGN", "spark"),
                ("Định vị thương hiệu mới", "Tái sinh hình ảnh sau 5 năm", "BRAND REFRESH", "heart"),
                ("Kế hoạch social media Q2", "Nội dung 90 ngày theo cụm chủ đề", "SOCIAL · Q2", "phone"),
                ("Ra mắt sản phẩm mới", "Hành trình tới ngày D-day", "PRODUCT LAUNCH", "rocket"),
                ("Phân tích chân dung khách hàng", "Hiểu sâu để nói đúng", "PERSONA INSIGHT", "people"),
                ("Chiến lược KOL & KOC", "Mạng lưới người ảnh hưởng phân lớp", "INFLUENCER", "spark"),
                ("Báo cáo hiệu quả chiến dịch", "Đo lường ROAS và LTV", "CAMPAIGN REPORT", "chart"),
                ("Chiến lược nội dung TikTok", "Format ngắn, hook mạnh", "TIKTOK PLAYBOOK", "camera")
            }),
            Kickers: new() { "CHIẾN DỊCH", "THỊ TRƯỜNG", "ĐỐI TƯỢNG", "THÔNG ĐIỆP", "KÊNH", "NGÂN SÁCH", "KPI", "TIMELINE" },
            Bullets: new()
            {
                "Tăng độ nhận diện", "Tạo nhu cầu", "Chuyển đổi mua hàng",
                "Giữ chân khách hàng", "Khuyến khích chia sẻ", "Mở rộng cộng đồng",
                "Tối ưu chi phí", "Tăng tỉ lệ tương tác", "Cải thiện trải nghiệm",
                "Mở rộng tệp khách", "Tăng ARPU", "Giảm tỉ lệ bỏ giỏ"
            },
            Descriptions: new()
            {
                "Reach 8,5M người tiếp cận tự nhiên và trả phí thông qua TikTok, Reels và YouTube Shorts.",
                "Mạng lưới 120 KOC cấp vi mô đăng nội dung tự nhiên theo kịch bản brief mở.",
                "CTR mục tiêu 3,8% trên kênh paid social, đo lường theo từng cụm sáng tạo.",
                "ROAS dự kiến 4.6× nhờ kết hợp lookalike audience và retarget kỹ.",
                "Pop-up tại 3 thành phố lớn, mỗi điểm thu hút tối thiểu 800 lượt khách/ngày.",
                "Cộng tác với 5 nhãn hàng đồng hành để chia sẻ chi phí truyền thông.",
                "Email CRM phân khúc 8 nhóm, tỉ lệ mở mục tiêu 32%.",
                "Bộ sưu tập giới hạn 500 sản phẩm, kích hoạt cảm giác khan hiếm.",
                "Hashtag campaign #MuaHeCuaBan với mục tiêu 12 000 bài UGC."
            },
            Stats: new()
            {
                ("8,5M", "Reach"), ("3,8%", "CTR"), ("4.6×", "ROAS"),
                ("1 200", "UGC"), ("32%", "Email open"), ("12 tuần", "Thời lượng"),
                ("120", "KOC tham gia"), ("3", "Thành phố pop-up"), ("220K", "Followers tăng")
            },
            Steps: new()
            {
                ("T1", "Brief", "Định hướng và mục tiêu chung."),
                ("T2", "Sản xuất", "Bộ sáng tạo và quay chụp."),
                ("T3", "Khởi chạy", "Bùng nổ multi-channel."),
                ("T4", "Tối ưu", "Phân tích và điều chỉnh."),
                ("01", "Khám phá", "Nghiên cứu insight khách hàng."),
                ("02", "Định vị", "Chọn góc kể chuyện."),
                ("03", "Sản xuất", "Bộ assets đa nền tảng."),
                ("04", "Phân phối", "Đẩy mạnh trên các kênh chính."),
                ("05", "Đo lường", "Báo cáo và rút kinh nghiệm.")
            },
            People: new()
            {
                ("Trần Hà", "Trưởng dự án", "8 năm dẫn dắt chiến dịch tiêu dùng."),
                ("Nguyễn Quân", "Giám đốc sáng tạo", "Cựu CD của một agency hàng đầu."),
                ("Lê Mai", "Trưởng đối ngoại", "Mạng lưới quan hệ rộng với báo chí."),
                ("Phạm Linh", "Phụ trách performance", "Tối ưu paid media đa nền tảng.")
            },
            Rows: new()
            {
                ("Kênh", "Tỉ trọng", "CPC dự kiến", "Mục tiêu chính"),
                ("TikTok & Reels", "42%", "5 800đ", "Reach + Engagement"),
                ("KOC + KOL micro", "23%", "—", "Tin cậy + UGC"),
                ("Email + CRM", "15%", "—", "Giữ chân"),
                ("Sự kiện pop-up", "12%", "—", "Trải nghiệm"),
                ("PR & báo chí", "8%", "—", "Uy tín thương hiệu")
            },
            Quotes: new()
            {
                "Marketing tốt khiến công ty trông thông minh. Marketing xuất sắc khiến khách hàng cảm thấy thông minh.",
                "Người ta không mua sản phẩm — họ mua phiên bản tốt hơn của chính mình.",
                "Sự chú ý là tiền tệ của thời đại này."
            },
            Authors: new() { ("JOE CHERNOV", "VP Marketing"), ("SETH GODIN", "Tác giả marketing"), ("HERBERT SIMON", "Nhà kinh tế") },
            Icons: new() { "heart", "spark", "phone", "camera", "people", "rocket", "globe" },
            AgendaHeads: new() { "Bối cảnh thị trường", "Chân dung khách hàng", "Thông điệp chủ đạo", "Kênh truyền thông", "KPI và đo lường", "Timeline triển khai" },
            AgendaDescs: new() { "Xu hướng tiêu dùng nổi bật.", "Ba persona chính.", "Một câu nói cho cả chiến dịch.", "Kết hợp paid + owned + earned.", "Chỉ số đo lường thành công.", "Cột mốc 12 tuần." }
        );

        private static TopicPack BuildTech() => new(
            "congnghe",
            MakeDecks(new (string, string, string, string)[]
            {
                ("Kiến trúc hệ thống microservices", "Từ monolith tới mesh có chủ đích", "ARCH · 2026", "code"),
                ("Đề xuất RFC: tầng cache mới", "Cải thiện độ trễ đọc 60%", "RFC · CACHING", "spark"),
                ("Giới thiệu sản phẩm SaaS", "Bộ công cụ cho đội ngũ remote", "PRODUCT TOUR", "rocket"),
                ("Đánh giá an ninh hệ thống", "Tổng kết kiểm thử quý 1", "SECURITY AUDIT", "shield"),
                ("Lộ trình dữ liệu 2026", "Từ data lake đến lakehouse", "DATA ROADMAP", "chart"),
                ("Tài liệu kỹ thuật onboarding", "Cẩm nang cho kỹ sư mới", "ONBOARDING", "doc"),
                ("Sự cố P0: phân tích postmortem", "Bài học từ downtime 47 phút", "POSTMORTEM", "shield"),
                ("Đề xuất chuyển sang Kubernetes", "Đánh đổi và lộ trình", "K8S MIGRATION", "globe")
            }),
            Kickers: new() { "KIẾN TRÚC", "VẤN ĐỀ", "GIẢI PHÁP", "STACK", "HIỆU NĂNG", "AN NINH", "RFC", "ROADMAP" },
            Bullets: new()
            {
                "Tách dịch vụ theo bounded context", "Quản lý cấu hình tập trung", "Quan sát đầu cuối",
                "Triển khai an toàn", "Tự phục hồi", "Mở rộng theo nhu cầu",
                "Bảo mật mặc định", "Tự động hoá CI/CD", "Tài liệu sống cùng code",
                "Đo lường mọi thứ", "Thiết kế cho thất bại", "Đơn giản trước tối ưu"
            },
            Descriptions: new()
            {
                "Mỗi service sở hữu dữ liệu riêng và giao tiếp qua API rõ ràng, hạn chế phụ thuộc chéo.",
                "Service mesh (Linkerd) xử lý retry, timeout và mTLS giúp giảm code trùng lặp.",
                "Tracing đầu cuối qua OpenTelemetry giúp truy vết sự cố trong < 5 phút.",
                "Triển khai progressive: canary 5% → 25% → 100% kèm auto-rollback nếu SLO suy giảm.",
                "Database per service với pattern Saga xử lý transaction phân tán.",
                "Idempotency keys ở mọi API write để khách hàng retry an toàn.",
                "Rate limit token bucket áp dụng ở edge — chống burst traffic bất thường.",
                "GitOps qua ArgoCD: mọi thay đổi infra đi qua pull request có review.",
                "RBAC chuẩn least-privilege, audit log lưu trữ 18 tháng."
            },
            Stats: new()
            {
                ("99,97%", "API availability"), ("189ms", "P95 latency"), ("99,8%", "Scheduling success"),
                ("0,4×", "Error budget burn"), ("2,1k", "RPS đỉnh"), ("47 phút", "MTTR mục tiêu"),
                ("12", "Services"), ("3", "AZ triển khai"), ("60%", "Cache hit ratio")
            },
            Steps: new()
            {
                ("S1", "Tách webhook validation", "Đưa policy ra khỏi core controller."),
                ("S2", "Thêm tracing đầu-cuối", "Propagate trace-id qua client-go."),
                ("S3", "Chaos thử kịch bản etcd", "Kill 1 node, đo lại MTTR."),
                ("S4", "Tổng kết & RFC", "Viết RFC cho thay đổi schedule profile."),
                ("01", "Phân tích yêu cầu", "Hiểu use case nghiệp vụ."),
                ("02", "Thiết kế kỹ thuật", "Sơ đồ và chọn công nghệ."),
                ("03", "Triển khai", "Code, test, review."),
                ("04", "Quan sát", "Metric, log, trace."),
                ("05", "Cải tiến", "Iterate dựa trên dữ liệu thật.")
            },
            People: new()
            {
                ("Đặng Sơn", "Trưởng nhóm hạ tầng", "15 năm vận hành hệ thống quy mô lớn."),
                ("Trần Hà", "Kỹ sư trưởng", "Chuyên gia distributed systems."),
                ("Nguyễn Quân", "Kỹ sư an ninh", "Cựu kỹ sư bảo mật ngân hàng."),
                ("Lê Mai", "Engineering manager", "Quản lý 3 đội phát triển sản phẩm.")
            },
            Rows: new()
            {
                ("Chỉ số", "Mục tiêu", "Hiện tại", "Cửa sổ"),
                ("API availability", "99,95%", "99,97%", "30 ngày"),
                ("P95 latency", "≤ 250 ms", "189 ms", "7 ngày"),
                ("Scheduling success", "≥ 99,5%", "99,8%", "24 giờ"),
                ("Error budget burn", "≤ 1×", "0,4×", "thực thời")
            },
            Quotes: new()
            {
                "Bất cứ hệ thống đủ phức tạp nào cũng có lúc trông như được vận hành bởi phép màu.",
                "Đơn giản là sự tinh tế tối thượng.",
                "Mọi thiết kế là một chuỗi đánh đổi — vấn đề là bạn có biết mình đánh đổi gì không."
            },
            Authors: new() { ("KHUYẾT DANH", "Truyền thuyết kỹ sư"), ("LEONARDO DA VINCI", "Họa sĩ & kỹ sư"), ("FRED BROOKS", "Tác giả 'Mythical Man-Month'") },
            Icons: new() { "code", "shield", "spark", "rocket", "gear", "globe", "chart" },
            AgendaHeads: new() { "Bối cảnh hiện tại", "Vấn đề kỹ thuật", "Giải pháp đề xuất", "Lộ trình", "Đánh đổi & rủi ro", "Đo lường thành công" },
            AgendaDescs: new() { "Hệ thống đang gặp giới hạn nào.", "Phân tích nguyên nhân gốc.", "Kiến trúc mục tiêu.", "Triển khai theo sprint.", "Điều gì có thể đi sai.", "SLI/SLO cụ thể." }
        );

        private static TopicPack BuildStartup() => new(
            "khoinghiep",
            MakeDecks(new (string, string, string, string)[]
            {
                ("Pitch deck Series A", "Tài chính cá nhân dựa trên hành vi", "PITCH · SERIES A", "rocket"),
                ("Pre-seed pitch", "Ý tưởng và đội ngũ giai đoạn đầu", "PRE-SEED", "spark"),
                ("Cập nhật nhà đầu tư hàng quý", "Q1 traction và kế hoạch Q2", "INVESTOR UPDATE", "chart"),
                ("Đề xuất gọi vốn Series B", "Mở rộng khu vực Đông Nam Á", "SERIES B", "globe"),
                ("Demo day pitch 5 phút", "Phiên bản rút gọn cho sân khấu", "DEMO DAY", "spark"),
                ("Kế hoạch go-to-market", "Lộ trình 12 tháng đầu", "GTM PLAN", "rocket"),
                ("Bộ tài liệu đối tác", "Giới thiệu chương trình hợp tác", "PARTNERSHIP", "people"),
                ("Đánh giá thị trường ngách", "Tại sao bây giờ là đúng lúc", "MARKET BRIEF", "target")
            }),
            Kickers: new() { "PITCH", "VẤN ĐỀ", "GIẢI PHÁP", "THỊ TRƯỜNG", "TRACTION", "MÔ HÌNH", "ĐỘI NGŨ", "KÊU GỌI" },
            Bullets: new()
            {
                "Vấn đề lớn, chưa giải quyết", "Đội ngũ phù hợp", "Sản phẩm khác biệt",
                "Mô hình mở rộng", "Thị trường đang lớn", "Bằng chứng kéo dài",
                "Đối tác chiến lược", "Công nghệ độc quyền", "Đường tới lợi nhuận",
                "Rào cản gia nhập", "Hiệu ứng mạng", "Chi phí chuyển đổi cao"
            },
            Descriptions: new()
            {
                "63% người 22–32 không lập ngân sách quá 1 tháng — họ cần công cụ tự động.",
                "Chi phí thuê bao quên huỷ trung bình 2,1× so với mức cần thiết, riêng tại đô thị.",
                "Thời gian để hiểu một sao kê thẻ trung bình 11 giờ trong cả tháng.",
                "Open Banking mở ra dữ liệu thời gian thực — chúng tôi xây trên lớp đó.",
                "Đội ngũ founder từng scale 0 → 2M user tại một startup Đông Nam Á.",
                "ARPU dự kiến $12/tháng cho gói trả phí — tỉ lệ chuyển đổi 5,2%.",
                "Phí giới thiệu từ ngân hàng đối tác bổ sung 25% doanh thu.",
                "Tỉ lệ giữ chân 30 ngày đầu đạt 41% — gấp đôi mức ngành.",
                "Mục tiêu Series A 6 triệu USD để mở rộng sản phẩm và thị trường."
            },
            Stats: new()
            {
                ("84k", "Người dùng"), ("$12", "ARPU/tháng"), ("5,2%", "Free → Paid"),
                ("92", "NPS 30 ngày"), ("$1.4M", "ARR"), ("18%", "Tăng trưởng MoM"),
                ("$3.8B", "TAM"), ("$420M", "SAM"), ("$48M", "SOM 3 năm")
            },
            Steps: new()
            {
                ("L1", "Đọc hành vi", "Kết nối ngân hàng, phân loại giao dịch."),
                ("L2", "Đề xuất theo tuần", "Mẹo cá nhân hoá tự động."),
                ("L3", "Tự thực thi", "Người dùng bấm 1 lần là xong."),
                ("M1-3", "Hoàn thiện sản phẩm", "Mở rộng tính năng đầu tư."),
                ("M4-9", "Tăng trưởng", "Mở rộng ra HN, ĐN, CT."),
                ("M10-15", "Bắt tay ngân hàng", "Ký 3 đối tác BFSI lớn."),
                ("M16-18", "Mở rộng khu vực", "Bước chân sang Thái Lan.")
            },
            People: new()
            {
                ("Trần Hà", "CEO", "Ex-Product Lead, từng scale 0→2M user."),
                ("Nguyễn Quân", "CTO", "Ex-Staff Engineer, kiến trúc thanh toán."),
                ("Lê Minh", "COO", "Ex-Head of Ops neobank, vận hành 200+."),
                ("Phạm Linh", "Head of Growth", "Cựu trưởng tăng trưởng tại fintech khu vực."),
                ("Đặng Sơn", "Cố vấn", "Founder thoát thành công Series C.")
            },
            Rows: new()
            {
                ("Hạng mục", "% ngân sách", "Mục tiêu", "Kết quả mong đợi"),
                ("Sản phẩm & AI", "40%", "Ra mắt 3 tính năng lõi", "Tăng retention 30 ngày"),
                ("Mở rộng thị trường", "30%", "Vào 3 thành phố mới", "Tăng MAU 3×"),
                ("Tuân thủ & rủi ro", "15%", "Đạt chứng chỉ PCI DSS", "Sẵn sàng B2B"),
                ("Vận hành dự phòng", "15%", "Runway 18 tháng", "Bền vững đến milestone tiếp")
            },
            Quotes: new()
            {
                "Ý tưởng rẻ. Triển khai là tất cả.",
                "Một startup là một tổ chức tạo ra trong điều kiện cực kỳ bất định.",
                "Khoảnh khắc tốt nhất để bắt đầu là 10 năm trước. Khoảnh khắc tốt thứ hai là bây giờ."
            },
            Authors: new() { ("REID HOFFMAN", "Founder LinkedIn"), ("ERIC RIES", "Tác giả Lean Startup"), ("KHUYẾT DANH", "Châm ngôn cổ") },
            Icons: new() { "rocket", "chart", "target", "people", "spark", "money", "globe" },
            AgendaHeads: new() { "Vấn đề", "Giải pháp", "Thị trường", "Sản phẩm", "Traction", "Đội ngũ", "Kêu gọi vốn" },
            AgendaDescs: new() { "Đau gì, đau bao nhiêu.", "Vì sao của chúng tôi đáng tin.", "Quy mô và tốc độ.", "Demo và lộ trình.", "Bằng chứng hiện tại.", "Người đứng sau ý tưởng.", "Số tiền và lý do." }
        );

        private static TopicPack BuildCreative() => new(
            "sangtao",
            MakeDecks(new (string, string, string, string)[]
            {
                ("Portfolio studio thiết kế", "Tuyển chọn dự án 2024–2026", "PORTFOLIO · 2026", "camera"),
                ("Đề xuất bộ nhận diện", "Thương hiệu cho quán cà phê", "BRAND PROPOSAL", "spark"),
                ("Bộ sưu tập thời trang Xuân Hè", "Câu chuyện màu sắc và chất liệu", "LOOKBOOK", "heart"),
                ("Concept moodboard phim ngắn", "Hình ảnh, âm thanh, nhịp", "MOODBOARD", "camera"),
                ("Trình bày kiến trúc nhà ở", "Bản phác thảo concept", "ARCHITECTURE", "doc"),
                ("Bộ ảnh kỉ niệm 10 năm studio", "Hành trình một thập kỉ", "ANNIVERSARY", "heart"),
                ("Đề xuất minh hoạ sách thiếu nhi", "Mười hai câu chuyện ngắn", "ILLUSTRATION", "bulb"),
                ("Triển lãm cá nhân 'Đất & Nước'", "Tổng kết một năm sáng tác", "EXHIBITION", "leaf")
            }),
            Kickers: new() { "DỰ ÁN", "Ý TƯỞNG", "BẢNG MÀU", "CHẤT LIỆU", "QUY TRÌNH", "KẾT QUẢ", "KHÁCH HÀNG", "LIÊN HỆ" },
            Bullets: new()
            {
                "Tinh tế trong chi tiết", "Tôn trọng người xem", "Kể chuyện bằng hình ảnh",
                "Vật liệu thật, nguyên bản", "Cảm xúc trước kỹ thuật", "Đơn giản hoá có chủ đích",
                "Tỉ lệ vàng", "Khoảng nghỉ thị giác", "Tương phản có lý do",
                "Bố cục dẫn mắt", "Màu sắc nhất quán", "Typography mạch lạc"
            },
            Descriptions: new()
            {
                "Mỗi dự án bắt đầu bằng một cuộc trò chuyện dài về câu chuyện thương hiệu.",
                "Bộ nhận diện gồm logo, bảng màu, typography và hướng dẫn sử dụng đầy đủ.",
                "Tinh thần Á Đông được diễn giải bằng ngôn ngữ thiết kế đương đại.",
                "Chất liệu giấy mỹ thuật in kỹ thuật số kết hợp foil thủ công.",
                "Quy trình ba vòng phản hồi giúp ý tưởng được tinh chỉnh đúng hướng.",
                "Bộ ấn phẩm in trên giấy không tẩy clo — thân thiện môi trường.",
                "Concept moodboard kết hợp tham chiếu phim cổ điển và nhiếp ảnh đường phố.",
                "Bản phối màu giới hạn 5 sắc, mỗi sắc có lý do và vai trò rõ ràng.",
                "Mỗi tác phẩm đi kèm câu chuyện ngắn được in trên thẻ phụ."
            },
            Stats: new()
            {
                ("142", "Dự án hoàn thành"), ("38", "Khách hàng dài hạn"), ("12", "Giải thưởng quốc gia"),
                ("4.9/5", "Đánh giá khách hàng"), ("10 năm", "Hành trình studio"), ("6", "Lĩnh vực phục vụ"),
                ("48", "Triển lãm tham gia"), ("3", "Quốc gia hợp tác"), ("220", "Mẫu thiết kế xuất bản")
            },
            Steps: new()
            {
                ("01", "Lắng nghe", "Phỏng vấn sâu khách hàng."),
                ("02", "Khám phá", "Nghiên cứu thị trường và cảm hứng."),
                ("03", "Phác thảo", "Ba hướng concept khác biệt."),
                ("04", "Tinh chỉnh", "Lặp lại theo phản hồi."),
                ("05", "Hoàn thiện", "Bàn giao toàn bộ assets."),
                ("06", "Đồng hành", "Hỗ trợ sau khi ra mắt.")
            },
            People: new()
            {
                ("Trần Hà", "Giám đốc sáng tạo", "Tốt nghiệp Mỹ thuật Yết Kiêu, 12 năm trong nghề."),
                ("Nguyễn Quân", "Phụ trách Brand", "Cựu Senior Designer tại agency quốc tế."),
                ("Lê Mai", "Phụ trách Print", "Chuyên gia in ấn thủ công và bao bì."),
                ("Phạm Linh", "Phụ trách Digital", "Web, motion và tương tác."),
                ("Đặng Sơn", "Quản lý dự án", "Đảm bảo tiến độ và chất lượng.")
            },
            Rows: new()
            {
                ("Hạng mục", "Khởi đầu", "Phát triển", "Hoàn thiện"),
                ("Khái niệm", "Brainstorm", "Lựa chọn 3 hướng", "Chốt 1 hướng"),
                ("Thiết kế", "Phác thảo nháp", "Bản chi tiết", "Bản cuối"),
                ("Phản hồi", "Tự đánh giá", "Khách phản hồi", "Tinh chỉnh"),
                ("Bàn giao", "—", "—", "Assets + hướng dẫn")
            },
            Quotes: new()
            {
                "Thiết kế không phải vẻ ngoài. Thiết kế là cách nó vận hành.",
                "Sáng tạo là cho phép mình mắc sai lầm. Nghệ thuật là biết giữ lại cái nào.",
                "Đơn giản hoá đến mức không thể bỏ thêm gì — không phải khi không thể thêm gì nữa."
            },
            Authors: new() { ("STEVE JOBS", "Apple"), ("SCOTT ADAMS", "Họa sĩ Dilbert"), ("ANTOINE DE SAINT-EXUPÉRY", "Nhà văn") },
            Icons: new() { "camera", "heart", "spark", "leaf", "bulb", "doc" },
            AgendaHeads: new() { "Giới thiệu studio", "Triết lý làm việc", "Dự án nổi bật", "Quy trình", "Khách hàng đồng hành", "Liên hệ" },
            AgendaDescs: new() { "Một thập kỉ sáng tạo.", "Tinh tế, kể chuyện, có trách nhiệm.", "Sáu dự án tiêu biểu.", "Sáu bước từ ý tưởng tới ra mắt.", "Những thương hiệu tin chúng tôi.", "Email, mạng xã hội, văn phòng." }
        );

        private static TopicPack BuildEvent() => new(
            "sukien",
            MakeDecks(new (string, string, string, string)[]
            {
                ("Kế hoạch sự kiện kỉ niệm", "Mừng 10 năm thành lập công ty", "ANNIVERSARY", "spark"),
                ("Hồ sơ năng lực cá nhân", "CV trình bày trong cuộc phỏng vấn", "PERSONAL CV", "doc"),
                ("Lễ cưới · Album và kế hoạch", "Hành trình một ngày đặc biệt", "WEDDING", "heart"),
                ("Workshop kỹ năng mềm", "Hai ngày học và thực hành", "WORKSHOP", "bulb"),
                ("Báo cáo team building", "Tổng kết chuyến đi 3 ngày", "TEAM BUILDING", "people"),
                ("Đề xuất tổ chức gala dinner", "Đêm trao thưởng cuối năm", "GALA NIGHT", "calendar"),
                ("Sinh nhật concept · 30 tuổi", "Câu chuyện một thập kỉ rưỡi", "BIRTHDAY", "heart"),
                ("Báo cáo từ thiện cộng đồng", "Chuyến đi mùa hè 2026", "COMMUNITY", "leaf")
            }),
            Kickers: new() { "SỰ KIỆN", "MỤC ĐÍCH", "CHỦ ĐỀ", "ĐỊA ĐIỂM", "CHƯƠNG TRÌNH", "NGÂN SÁCH", "KHÁCH MỜI", "GHI NHỚ" },
            Bullets: new()
            {
                "Trải nghiệm khó quên", "Kết nối ý nghĩa", "Tôn vinh đóng góp",
                "Tạo kỉ niệm chung", "Truyền cảm hứng", "Củng cố văn hoá",
                "Mở rộng mạng lưới", "Ghi nhận thành tựu", "Khởi đầu mới",
                "Học hỏi lẫn nhau", "Lan toả giá trị", "Cảm ơn chân thành"
            },
            Descriptions: new()
            {
                "Sự kiện diễn ra tại Khách sạn Lotte tầng 65 với view toàn cảnh thành phố.",
                "120 khách mời gồm đối tác, nhân viên gắn bó 5+ năm và bạn bè thân hữu.",
                "Chương trình kéo dài 3 giờ với phần trao thưởng, biểu diễn và giao lưu tự do.",
                "Menu fusion 5 món được thiết kế riêng cho dịp này.",
                "Quà tặng kỉ niệm là phiên bản giới hạn 200 chiếc, đánh số thủ công.",
                "Phần biểu diễn nhạc sống do ban nhạc địa phương trình diễn xuyên suốt.",
                "Khu vực chụp ảnh được trang trí theo concept 'Mười năm hành trình'.",
                "Sự kiện được livestream cho nhân viên ở chi nhánh xa.",
                "Đội ngũ hậu cần 18 người đảm bảo mọi tiểu tiết vận hành mượt."
            },
            Stats: new()
            {
                ("120", "Khách mời"), ("3 giờ", "Thời lượng"), ("5", "Tiết mục"),
                ("18", "Hậu cần"), ("200", "Quà giới hạn"), ("65F", "Tầng tổ chức"),
                ("10 năm", "Kỉ niệm"), ("4 chủ đề", "Khu vực trang trí"), ("100%", "Khách xác nhận")
            },
            Steps: new()
            {
                ("T-30", "Lên kế hoạch", "Brief, ngân sách, đội ngũ."),
                ("T-21", "Đặt địa điểm", "Hợp đồng và F&B."),
                ("T-14", "Sản xuất", "Quà, trang trí, tài liệu."),
                ("T-7", "Truyền thông", "Thư mời, RSVP, lịch trình."),
                ("T-1", "Tổng duyệt", "Run-through toàn bộ chương trình."),
                ("T0", "Sự kiện", "Vận hành ngày diễn ra.")
            },
            People: new()
            {
                ("Trần Hà", "Trưởng ban tổ chức", "Phụ trách tổng thể và liên lạc khách VIP."),
                ("Nguyễn Quân", "Hậu cần", "Điều phối địa điểm, F&B, kỹ thuật."),
                ("Lê Mai", "Truyền thông", "Thư mời, mạng xã hội, livestream."),
                ("Phạm Linh", "Sáng tạo", "Concept trang trí và quà tặng."),
                ("Đặng Sơn", "MC chương trình", "Dẫn dắt và kết nối các phần.")
            },
            Rows: new()
            {
                ("Hạng mục", "Số lượng", "Đơn giá", "Tổng"),
                ("Địa điểm + F&B", "120 khách", "1,5tr/khách", "180tr"),
                ("Trang trí", "—", "—", "45tr"),
                ("Quà tặng giới hạn", "200 phần", "350K", "70tr"),
                ("Truyền thông + ảnh", "—", "—", "28tr"),
                ("Dự phòng", "10%", "—", "32tr")
            },
            Quotes: new()
            {
                "Mọi khoảnh khắc đẹp đều bắt đầu từ một kế hoạch tử tế.",
                "Người ta sẽ quên những gì bạn nói, nhưng nhớ cảm xúc bạn tạo ra.",
                "Sự kiện tốt là sự kiện mà khách cảm thấy như chính họ thuộc về."
            },
            Authors: new() { ("KHUYẾT DANH", "Người tổ chức sự kiện"), ("MAYA ANGELOU", "Nhà thơ"), ("ĐẶNG SƠN", "MC chuyên nghiệp") },
            Icons: new() { "heart", "calendar", "spark", "people", "leaf", "mail" },
            AgendaHeads: new() { "Giới thiệu sự kiện", "Mục đích và chủ đề", "Chương trình chi tiết", "Khách mời và hậu cần", "Ngân sách", "Lịch trình triển khai" },
            AgendaDescs: new() { "Một dịp đặc biệt cần một câu chuyện riêng.", "Vì sao tổ chức và tổ chức cho ai.", "Từng phần và thời lượng.", "Ai đến và ai phụ trách gì.", "Phân bổ chi phí minh bạch.", "30 ngày chuẩn bị." }
        );
    }
}
