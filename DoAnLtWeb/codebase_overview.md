# Slidify - Tài Liệu Tổng Quan Codebase (Codebase Overview)

Tài liệu này được tạo ra để lưu trữ toàn bộ cấu trúc, luồng xử lý và chi tiết kỹ thuật của dự án **Slidify**. Khi bắt đầu một phiên làm việc mới với AI, bạn chỉ cần yêu cầu AI đọc tệp này (`codebase_overview.md`) thay vì quét toàn bộ thư mục dự án, giúp tiết kiệm lượng lớn token và chi phí.

---

## 1. Công Nghệ Sử Dụng (Tech Stack)

- **Backend**: ASP.NET Core 8.0 MVC & Web API.
- **Database**: Microsoft SQL Server thông qua Entity Framework Core (Code-First).
- **Authentication**: ASP.NET Core Identity (`User` kế thừa `IdentityUser<int>`).
- **External Auth**: Google OAuth (đăng nhập bằng tài khoản Google).
- **Frontend**: HTML5, Vanilla CSS, TailwindCSS (cho các công cụ bổ sung), JavaScript thuần (Vanilla JS), thư viện đồ họa **Fabric.js** để vẽ và thao tác trên Slide.
- **Python Helpers**:
  - Chuyển đổi tài liệu sang Markdown: Thư viện **Microsoft MarkItDown**.
  - Nhập slide từ PowerPoint: Chuyển đổi tệp PPTX sang SVG/JSON tương thích Fabric.js.

---

## 2. Cấu Trúc Cơ Sở Dữ Liệu (Database Schema)

Cơ sở dữ liệu được định nghĩa trong `DoAnLtWeb.Data.AppDbContext`. Các bảng chính bao gồm:

### 2.1. Bảng `Users` (`User.cs`)
Kế thừa `IdentityUser<int>` hỗ trợ xác thực.
- `IsVip` (`bool`): Trạng thái tài khoản VIP (mặc định: `false`).
- `VipPlanName` (`string`): Tên gói VIP (mặc định: `"Free"`).
- `VipExpiresAt` (`DateTime?`): Hạn dùng gói VIP.
- *Liên kết*: Một User có nhiều `Projects` và nhiều `PaymentTransactions`.

### 2.2. Bảng `Presentations` (`Presentation.cs`)
Lưu trữ các bản thuyết trình hoặc các Slide mẫu (Templates).
- `Id` (`int`): Khóa chính.
- `Title` (`string`): Tiêu đề bản thuyết trình.
- `UserId` (`int`): Khóa ngoại liên kết tới `Users`.
- `CreatedAt`, `UpdatedAt` (`DateTime`): Thời gian tạo/cập nhật.
- `IsTemplate` (`bool`): Đánh dấu có phải là slide mẫu dùng chung hay không.
- `IsPremiumTemplate` (`bool`): Slide mẫu trả phí dành cho VIP.
- `Category` (`string`): Danh mục slide (ví dụ: Doanh nghiệp, Sáng tạo, Giáo dục...).
- `ThumbnailUrl` (`string`): Đường dẫn ảnh đại diện slide.
- `PremiumReason` (`string`): Lý do yêu cầu trả phí (ví dụ: Slide dài trên 10 trang).
- *Liên kết*: Chứa một danh sách các `Slides` (`ICollection<Slide>`).

### 2.3. Bảng `Slides` (`Slide.cs`)
Chi tiết từng trang slide trong một Presentation.
- `Id` (`int`): Khóa chính.
- `PresentationId` (`int`): Khóa ngoại liên kết tới `Presentations` (Cascade Delete).
- `PageNumber` (`int`): Số thứ tự trang.
- `BackgroundColor` (`string`): Mã màu nền (mặc định: `"#ffffff"`).
- `BackgroundImage` (`string?`): Đường dẫn hình nền slide.
- `ElementsJson` (`string`): Lưu trữ toàn bộ các đối tượng hình vẽ, chữ (Fabric.js objects) dưới dạng chuỗi JSON Array.

### 2.4. Bảng `PaymentTransactions` (`PaymentTransaction.cs`)
Quản lý các giao dịch thanh toán nâng cấp tài khoản VIP.
- `Id` (`int`): Khóa chính.
- `UserId` (`int`): Khóa ngoại liên kết tới `Users`.
- `PaymentCode` (`string`): Mã giao dịch độc nhất dạng `VIPyymmddhhmmssUserId` (Unique Index).
- `PlanName` (`string`): Tên gói đăng ký (ví dụ: `"VIP Monthly"`).
- `Amount` (`decimal`): Số tiền cần thanh toán.
- `Status` (`string`): Trạng thái giao dịch (`"Pending"`, `"Submitted"`, `"Confirmed"`, `"Rejected"`).
- `BankName` (`string`): Tên ngân hàng thụ hưởng (mặc định: `"MBBank"`).
- `AccountNumber` (`string`): Số tài khoản nhận tiền (mặc định: `"1111122005"`).
- `AccountName` (`string`): Tên chủ tài khoản nhận (mặc định: `"Tran Minh Khang"`).
- `TransferContent` (`string`): Nội dung chuyển khoản yêu cầu (ví dụ: `SLIDIFY VIP26060814...`).
- `VietQrUrl` (`string`): Link ảnh mã VietQR tự động sinh ra.
- `CreatedAt` (`DateTime`): Thời gian tạo giao dịch.
- `ConfirmedAt` (`DateTime?`): Thời gian admin phê duyệt giao dịch.
- `ExpiresAt` (`DateTime`): Thời gian hết hạn thanh toán (12 giờ kể từ khi tạo).
- `Note` (`string`): Ghi chú giao dịch.

### 2.5. Bảng `Projects` (`Project.cs`)
Bảng phụ lưu trữ dữ liệu JSON thô của người dùng (dùng cho các chức năng nháp hoặc các phiên bản cũ).
- `Id` (`int`): Khóa chính.
- `Name` (`string`): Tên dự án.
- `SlideDataJson` (`string`): Dữ liệu slide JSON thô.
- `UserId` (`int`): Khóa ngoại liên kết tới `Users`.

---

## 3. Các Controller và API Endpoints

### 3.1. `AccountController.cs` (Đăng nhập & Đăng ký)
- **Cơ chế đặc biệt**: Có khả năng tự động phát hiện mật khẩu băm theo chuẩn BCrypt cũ (`user.PasswordHash.StartsWith("$")`). Nếu người dùng nhập đúng mật khẩu, hệ thống sẽ tự động băm lại mật khẩu bằng thuật toán PBKDF2 mặc định của ASP.NET Identity (`PasswordHasher.HashPassword`) và lưu lại để nâng cao bảo mật mà không gây gián đoạn trải nghiệm của người dùng.
- **Endpoints**:
  - `[GET] /Account/Login` & `/Account/Register`: Trả về View đăng nhập/đăng ký nếu chưa đăng nhập.
  - `[POST] /Account/Login`: Kiểm tra đăng nhập (xử lý cả BCrypt cũ và PBKDF2 mới).
  - `[POST] /Account/Register`: Tạo tài khoản người dùng mới.
  - `[POST] /Account/ExternalLogin`: Gửi yêu cầu đăng nhập qua tài khoản Google.
  - `[GET] /Account/ExternalLoginCallback`: Nhận kết quả từ Google OAuth, tự động tạo tài khoản người dùng nếu chưa tồn tại.
  - `[POST] /Account/Logout`: Đăng xuất tài khoản.

### 3.2. `HomeController.cs` (Trang chủ & Dashboard)
- Yêu cầu đăng nhập (`[Authorize]`).
- **Endpoints**:
  - `[GET] /Home/Index(string? category, string? search)`:
    - Hiển thị danh sách slide của cá nhân người dùng (tối đa 15 bản ghi, xếp theo thời gian cập nhật giảm dần).
    - Hiển thị danh sách Slide Mẫu (Templates) dùng chung (đã được lọc bỏ các slide rác hoặc slide tiếng Trung chứa ký tự đặc biệt).
    - Truyền dữ liệu sang View thông qua đối tượng `ExpandoObject` động.

### 3.3. `BillingController.cs` (Thanh toán & Nâng cấp VIP)
- Quản lý các gói dịch vụ (`Free`, `VIP Monthly` giá 99.000đ/tháng).
- **Endpoints**:
  - `[GET] /Billing/Upgrade`: Trang hiển thị các gói dịch vụ và thông tin VIP hiện tại.
  - `[POST] /Billing/CreatePayment`: Nhận gói đăng ký, sinh mã thanh toán, nội dung chuyển khoản và tạo URL VietQR tự động (`https://img.vietqr.io/image/mb-1111122005-compact2.png?...`), sau đó tạo một giao dịch ở trạng thái `"Pending"`.
  - `[GET] /Billing/Payment/{id}`: Trang hiển thị thông tin chuyển khoản cùng mã QR để người dùng quét.
  - `[GET] /Billing/PaymentStatus/{id}`: Trả về trạng thái giao dịch hiện tại dạng JSON (dùng để AJAX cập nhật màn hình tự động).
  - `[POST] /Billing/MarkPaid/{id}`: Người dùng bấm xác nhận "Tôi đã chuyển khoản", cập nhật trạng thái sang `"Submitted"` để đợi admin duyệt.
  - `[POST] /Billing/ConfirmPayment/{id}`: (Chỉ dành cho Admin) Phê duyệt giao dịch, nâng cấp tài khoản người dùng lên VIP (`IsVip = true`, cộng thêm 30 ngày sử dụng VIP).

### 3.4. `SlideController.cs` (Trình biên tập slide)
- Trái tim của hệ thống biên tập slide dạng đồ họa.
- **Endpoints**:
  - `[POST] /Slide/Create`: Tạo một Presentation mới với tiêu đề mặc định và 1 trang slide trống nền trắng.
  - `[POST] /Slide/CloneTemplate/{id}`: Sao chép slide mẫu sang slide của cá nhân. Nếu slide mẫu là VIP, yêu cầu tài khoản người dùng phải có VIP đang hoạt động.
  - `[GET] /Slide/GetTemplates`: API trả về JSON chứa toàn bộ slide mẫu và các trang slide bên trong của chúng để hiển thị ở thanh công cụ Editor.
  - `[GET] /Slide/Edit/{id}`: Trả về View của Editor slide, truyền dữ liệu presentation và kiểm tra quyền VIP của người dùng hiện tại qua `ViewBag.IsVip`.
  - `[POST] /Slide/SavePresentation/{id}`: Nhận JSON chứa danh sách slide (BackgroundColor, BackgroundImage, ElementsJson) và ảnh Thumbnail đại diện (nếu thumbnail gửi dạng Base64, hệ thống sẽ giải mã thành file ảnh vật lý lưu tại `wwwroot/thumbnails/thumb_{id}.jpg`), sau đó cập nhật dữ liệu slide.
  - `[POST] /Slide/UploadImage`: Tải hình ảnh lên thư mục `wwwroot/uploads`.
  - `[POST] /Slide/PublishAsTemplate/{id}`: (Chỉ dành cho Admin) Xuất bản slide cá nhân thành slide mẫu dùng chung. Tự động đánh dấu Premium/VIP nếu số trang slide > 10.
  - `[POST] /Slide/Delete/{id}`: Xóa bản thuyết trình cá nhân.
  - `[POST] /Slide/Duplicate/{id}`: Nhân bản bản thuyết trình cá nhân.
  - `[POST] /Slide/CreateFromImport`: API hỗ trợ tạo presentation từ công cụ nhập PDF/PPTX bên ngoài.
  - `[POST] /Slide/SaveSeededTemplates`: (Dành cho việc seeding dữ liệu mẫu từ tệp JSON cấu hình).

### 3.5. `AdminController.cs` (Quản trị hệ thống & Nhập slide PPTX nâng cao)
- **Endpoints Quản trị**:
  - `[GET] /Admin/Dashboard`: Thống kê tổng quan (tổng người dùng, số thành viên VIP, số lượng slide mẫu, doanh thu giao dịch...).
  - `[GET] /Admin/Payments`: Hiển thị danh sách toàn bộ các giao dịch chuyển khoản.
  - `[POST] /Admin/ConfirmPayment/{id}`: Phê duyệt giao dịch nạp VIP.
  - `[POST] /Admin/RejectPayment/{id}`: Từ chối giao dịch nạp VIP.
  - `[GET] /Admin/Templates` & `[POST] /Admin/DeleteTemplate/{id}`: Quản lý slide mẫu.
  - `[POST] /Admin/DeleteTrashTemplates`: Tự động quét và xóa sạch các slide mẫu rác (slide không có trang nào hoặc chứa các từ khóa tiếng Trung).
- **Trình Nhập PPTX (PPTX Importer)**:
  - Cho phép admin tải tệp `.pptx` lên thư mục `wwwroot/slide-mau`.
  - Hệ thống sử dụng một chuỗi quy trình chuyển đổi sang Fabric.js Slide tự động:
    1. Đầu tiên, cố gắng gọi thư viện PowerPoint COM Object thông qua Automation để chạy ngầm xuất slide sang PNG chất lượng cao.
    2. Nếu thất bại, hệ thống sẽ cố gắng chuyển đổi PPTX sang PDF bằng cách gọi ứng dụng headless **LibreOffice** (`soffice.exe` tại `C:\Program Files\LibreOffice\program\soffice.exe`), sau đó kết xuất từng trang PDF sang PNG bằng thư viện **Docnet.Core**.
    3. Đọc dữ liệu XML nội bộ của tệp PPTX để phân tích các thành phần (Chữ, kích thước slide, màu sắc theme, hình khối cơ bản) và tự động ánh xạ, chuyển đổi các phần tử này sang định dạng Fabric.js tương ứng (`ParsePptxToFabricSlides()`), giúp người dùng có thể nhấp đúp để chỉnh sửa trực tiếp các khối văn bản đã nhập.

### 3.6. `ProjectController.cs` (API Dự Án Thô)
- Các endpoint CRUD dự án ở mức độ thô (`/api/Project`).

---

## 4. Giao Diện Người Dùng & JavaScript Client-side

### 4.1. Trình Biên Tập Chính (`wwwroot/js/slide-editor.js`)
- Quản lý trạng thái canvas Fabric.js, các nút thêm chữ, hình ảnh, hình khối (hình tròn, hình chữ nhật, tam giác, đường kẻ).
- Điều khiển thanh bên bao gồm: Slide cá nhân, Slide mẫu, Tải ảnh lên, Thêm thành phần đồ họa.
- Tự động lưu slide (`triggerAutoSave()`) và đồng bộ hóa với server.
- Quản lý danh sách trang slide (Thêm trang mới, nhân bản trang, xóa trang, thay đổi thứ tự).
- Cho phép xuất slide ra hình ảnh PNG hoặc tải xuống dưới dạng PDF.

### 4.2. Hệ Thống VIP Component (`wwwroot/js/slidify-vip-components.js`)
- Thêm một ngăn kéo "Components" chuyên biệt chứa các khối slide thiết kế sẵn bao gồm:
  - **Phổ biến (Free)**: Hero Banner, Quote Block (Khối trích dẫn), Badge Ribbon, Icon Card.
  - **Danh sách & Bước đi (Free)**: Numbered List, Step Diagram.
  - **Dữ liệu & Biểu đồ (Chỉ VIP)**: Progress Bar (Free), Stat Cards (Thẻ chỉ số), Timeline (Mốc thời gian), Bar Chart Block (Biểu đồ cột), KPI Dashboard.
  - **Tiếp thị (Marketing)**: CTA Section (Free), Callout Box (Free), Video Placeholder (Free), Pricing Table (Chỉ VIP), Feature Grid (Chỉ VIP).
  - **Thương hiệu & Xã hội**: Logo Chips (Free), Testimonial Card (Chỉ VIP).
  - **Khung hình (Frames)**: Image Frames (Free), Mockup Card (Chỉ VIP).
  - **Bảng biểu**: Comparison Table (Chỉ VIP).
  - **Nhóm & Giải thưởng**: Team Member Card (Chỉ VIP), Trophy Card (Free).
  - **Infographic**: Infographic Flow (Chỉ VIP), Countdown Block (Free).
  - **Trang trí (Free)**: Gradient Divider.
- **Kiểm soát quyền VIP**:
  - Chèn logic kiểm tra quyền sử dụng bằng hàm `ensureVipAccess(featureName)`.
  - Nếu người dùng miễn phí chọn phần tử VIP hoặc click áp dụng mẫu slide Premium (slide > 10 trang hoặc được admin gắn mác Premium), hệ thống sẽ chặn hành động, hiển thị thông báo toast và tự động chuyển hướng người dùng đến trang nạp VIP `/Billing/Upgrade` sau 500ms.

---

## 5. Công Cụ Hỗ Trợ Phía Ngoài (External Tools)

### 5.1. Chuyển đổi tài liệu sang Markdown (`MarkItDownTool`)
- **Giao diện**: `MarkItDown.cshtml` cung cấp giao diện tải tệp hiện đại (Kéo & Thả) hỗ trợ nhiều định dạng (`.pdf`, `.docx`, `.xlsx`, `.pptx`, `.html`, `.txt`, `.csv`).
- **Xử lý ngầm**: Khi người dùng nhấn chuyển đổi, hệ thống sẽ kích hoạt script Python `convert_to_md.py` chạy thư viện **Microsoft MarkItDown**. Script này sẽ đọc tệp, trích xuất cấu trúc văn bản, bảng biểu, liên kết và trả lại dữ liệu dạng văn bản Markdown chuẩn để hiển thị cho người dùng sao chép hoặc tải về file `.md`.
- *Lưu ý kỹ thuật*: 
  - Trong `MarkItDown.cshtml`, hành động fetch gửi yêu cầu đến `/Slide/ConvertToMarkdown`.
  - Trong `Index.cshtml`, nút điều hướng dẫn tới `/Home/MarkItDown`.
  - Hiện tại cả hai endpoint C# xử lý yêu cầu nhận tệp và gọi script Python để chuyển đổi (`ConvertToMarkdown` / `MarkItDown`) cần được hoàn thiện tích hợp hoàn chỉnh trong Controllers nếu muốn hoạt động chính thức.

### 5.2. Công cụ tự động nhập PPTX (`convert_pptx_to_svgs.py`)
- Script python nằm ở gốc thư mục dự án.
- Tự động phát hiện các file PPTX mới nằm trong `wwwroot/slide-mau`.
- Gọi một script python trung gian `pptx_to_svg.py` để xuất slide thành các file ảnh SVG tương thích.
- Đổi tên tệp kết quả theo định dạng số thứ tự và cập nhật thông tin metadata của slide mẫu vào tệp cấu hình JSON `wwwroot/examples/examples.json` để đồng bộ hiển thị ngoài trang chủ.

---

## 6. Lưu Ý Khi Phát Triển Tiếp Theo (Developer Notes)

1. **Thông tin tài khoản Admin mặc định**:
   - Email: `admin@slidify.com`
   - Mật khẩu: `Admin@123`
   - Tài khoản này được tự động tạo bởi `DbInitializer.Initialize` khi ứng dụng khởi chạy lần đầu tiên.
2. **Kích hoạt tài khoản VIP thủ công**:
   - Bạn có thể vào SQL Server và cập nhật dòng dữ liệu của tài khoản người dùng: Set `IsVip = 1`, `VipPlanName = 'Premium'`, và đặt `VipExpiresAt = '2026-12-31'` (hoặc bất kỳ ngày nào trong tương lai).
   - Hoặc đăng nhập bằng tài khoản Admin, truy cập `/Admin/Payments` và bấm duyệt một giao dịch VIP có sẵn.
3. **Các tệp tĩnh quan trọng**:
   - Biên tập slide chính: `wwwroot/js/slide-editor.js`
   - Thành phần VIP: `wwwroot/js/slidify-vip-components.js`
   - Cơ sở dữ liệu: `Data/AppDbContext.cs`
   - Logic nghiệp vụ slide: `Controllers/SlideController.cs` và `Controllers/AdminController.cs`
