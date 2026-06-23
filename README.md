# Slidify - Nền Tảng Thiết Kế & Biên Tập Slide Trực Tuyến

**Slidify** là một ứng dụng web hiện đại được phát triển trên nền tảng **ASP.NET Core 8.0 MVC**, cho phép người dùng thiết kế, biên tập các slide thuyết trình trực tuyến tương tự như Canva hoặc Google Slides. Dự án tích hợp các thư viện đồ họa mạnh mẽ, công cụ chuyển đổi tài liệu thông minh và hệ thống quản lý tài khoản VIP tiện lợi.

---

## 🚀 Tính Năng Nổi Bật

### 1. Trình Biên Tập Slide Kéo Thả (Slide Editor)
*   Sử dụng thư viện đồ họa **Fabric.js** để tạo canvas tương tác cao.
*   Hỗ trợ thêm/sửa/xóa các đối tượng hình khối (hình chữ nhật, hình tròn, hình tam giác, đường thẳng), văn bản (text), hình ảnh tải lên.
*   Thay đổi màu nền slide, chèn ảnh nền.
*   Tự động lưu tiến trình thiết kế (`auto-save`).
*   Quản lý danh sách trang slide: thêm trang mới, nhân bản trang, xóa trang, thay đổi thứ tự.
*   Xuất slide ra hình ảnh PNG hoặc tải xuống dưới dạng PDF chất lượng cao.

### 2. Thành Phần Thiết Kế Sẵn & Phân Quyền VIP (VIP Components)
*   Thư viện các khối slide thiết kế sẵn phong phú (Templates & Components):
    *   **Miễn phí (Free)**: Hero Banner, Quote Block, Badge Ribbon, Icon Card, Step Diagram, Progress Bar, v.v.
    *   **Trả phí (VIP)**: Stat Cards, Timeline, Bar Chart Block, KPI Dashboard, Pricing Table, Feature Grid, Testimonial Card, v.v.
*   Kiểm soát quyền VIP khi áp dụng các template cao cấp hoặc sử dụng các component đặc biệt. Tự động thông báo và hướng dẫn nâng cấp khi người dùng miễn phí chọn tính năng VIP.

### 3. Hệ Thống Thanh Toán & Nâng Cấp VIP (Billing & Payment)
*   Tích hợp thanh toán tự động qua cổng **VietQR** (sinh mã QR động hiển thị thông tin ngân hàng, số tiền và nội dung chuyển khoản).
*   Trạng thái giao dịch tự động đồng bộ thời gian thực thông qua AJAX.
*   Trang phê duyệt giao dịch và kích hoạt VIP 30 ngày dành cho Admin.

### 4. Công Cụ Chuyển Đổi Tài Liệu (MarkItDown Integration)
*   Tích hợp thư viện **Microsoft MarkItDown** của Python.
*   Giao diện kéo thả hiện đại hỗ trợ tải lên và chuyển đổi nhanh các định dạng tài liệu phổ biến (`.pdf`, `.docx`, `.xlsx`, `.pptx`, `.html`, v.v.) thành định dạng **Markdown** chuẩn để sao chép hoặc tải về.

### 5. Nhập Slide Từ PowerPoint (PPTX Importer)
*   Cho phép Admin nhập trực tiếp tệp `.pptx` của PowerPoint.
*   Hệ thống chuyển đổi ngầm sử dụng **PowerPoint COM Object** hoặc kết xuất PDF qua **LibreOffice Headless** kết hợp **Docnet.Core** để render các trang thành SVG/PNG.
*   Tự động phân tích cấu trúc XML của PowerPoint để giữ lại khả năng chỉnh sửa các khối văn bản trên Fabric.js canvas.

### 6. Đăng Nhập & Bảo Mật (Authentication)
*   Tích hợp **ASP.NET Core Identity** bảo mật.
*   Hỗ trợ đăng nhập bên thứ ba bằng **Google OAuth**.
*   Cơ chế tự động phát hiện và nâng cấp mật khẩu băm theo chuẩn BCrypt cũ sang chuẩn PBKDF2 của ASP.NET Identity mà không làm gián đoạn đăng nhập của người dùng.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

*   **Backend**: ASP.NET Core 8.0 MVC & Web API
*   **Database**: Microsoft SQL Server & Entity Framework Core (Code-First)
*   **Identity**: ASP.NET Core Identity
*   **Frontend**: HTML5, Vanilla CSS, TailwindCSS (dành cho một số tool bổ sung), Vanilla JavaScript
*   **Canvas Graphics**: Fabric.js
*   **Python Engine**: Microsoft MarkItDown, python-pptx

---

## 📋 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu Cầu Hệ Thống (Prerequisites)
*   [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
*   [Microsoft SQL Server](https://www.microsoft.com/sql-server/)
*   [Python 3.10+](https://www.python.org/) (để chạy công cụ chuyển đổi PPTX và MarkItDown)
*   *(Tùy chọn)* [LibreOffice](https://www.libreoffice.org/) (cần thiết nếu muốn chạy tính năng render PPTX bằng headless mode trên Windows)

### 2. Cấu Hình Cơ Sở Dữ Liệu
Mở tệp `DoAnLtWeb/appsettings.json` và chỉnh sửa chuỗi kết nối SQL Server của bạn:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=DoAnLtWebDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```

### 3. Cài Đặt Thư Viện Python
Cài đặt các thư viện Python cần thiết bằng pip:
```bash
pip install markitdown python-pptx
```

### 4. Chạy Khởi Tạo Database & Di Trú (Migrations)
Chạy lệnh sau trong Command Prompt / Terminal tại thư mục chứa file `.sln` để tạo database và tạo tài khoản Admin mặc định:
```bash
dotnet ef database update --project DoAnLtWeb
```

### 5. Khởi Chạy Dự Án
Chạy ứng dụng bằng lệnh:
```bash
dotnet run --project DoAnLtWeb
```
Ứng dụng sẽ chạy tại địa chỉ mặc định `http://localhost:5000` hoặc `https://localhost:5001`.

---

## 🔑 Tài Khoản Thử Nghiệm

Hệ thống sẽ tự động khởi tạo (seed) tài khoản Admin khi chạy lần đầu:
*   **Email**: `admin@slidify.com`
*   **Mật khẩu**: `Admin@123`

*(Tài khoản này có quyền truy cập trang quản trị `/Admin/Dashboard` để quản lý giao dịch nạp VIP, templates, và nhập slide).*

---

## 📁 Cấu Trúc Thư Mục Chính

```text
DoAnLtWeb/
│
├── DoAnLtWeb/                    # Mã nguồn chính của ứng dụng web
│   ├── Controllers/             # Các bộ điều khiển điều hướng và API (Slide, Admin, Account, Billing...)
│   ├── Models/                  # Khai báo cấu trúc dữ liệu Entity Framework (User, Presentation, Slide...)
│   ├── Views/                   # Giao diện hiển thị Razor Views
│   ├── Data/                    # AppDbContext và DbInitializer khởi tạo database
│   ├── wwwroot/                 # Các tệp tĩnh (CSS, JS biên tập slide-editor.js, uploads, ảnh mẫu...)
│   └── DoAnLtWeb.csproj         # Tệp cấu hình dự án .NET
│
├── seed_native_templates.py      # Script Python hỗ trợ tạo dữ liệu slide mẫu ban đầu
├── convert_pptx_to_svgs.py      # Script Python phục vụ việc import file PPTX
├── .gitignore                   # Loại bỏ các tệp rác và bảo mật thông tin nhạy cảm của dự án
└── README.md                    # Tài liệu hướng dẫn sử dụng này
```
