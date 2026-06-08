# Slidify - Codex Workspace Instructions

Bạn đang làm tiếp dự án đồ án `Slidify`, một web app thiết kế slide kiểu Canva.

## Workspace thực tế
- Workspace hiện tại: `C:\Users\khang\source\repos\DoAnLtWeb`
- App ASP.NET Core MVC thực sự nằm trong thư mục con: `DoAnLtWeb\`
- Khi sửa code, ưu tiên đọc và sửa trong project con `DoAnLtWeb/`

## Mục tiêu
Làm cho Slidify giống Canva hơn:
- có mẫu sẵn đẹp
- người dùng chọn mẫu rồi sửa chữ, thay hình
- có rất nhiều thành phần để kéo/chèn vào slide
- có gói VIP cho mẫu premium và tính năng nâng cao
- có luồng nâng cấp bằng VietQR

## Stack bắt buộc
- ASP.NET Core MVC
- Entity Framework Core
- ASP.NET Core Identity
- Google Authentication
- Fabric.js cho editor

## Bối cảnh hiện tại
- Dự án đã bắt đầu chuyển từ auth tự làm sang ASP.NET Core Identity
- Bảng `Users` cần được tận dụng lại
- Đã có phần template trong editor
- Đã có built-in templates lấy cảm hứng từ `hugohe3/ppt-master`
- Template phải editable thật, không phải ảnh dán chết
- Không phá phần đang làm dở, hãy tiếp tục từ code hiện có

## Phần cần làm tiếp

### 1. Template VIP
- Template trên 10 trang phải là VIP
- Một số template đẹp/xịn cũng là VIP
- User free vẫn nhìn thấy nhưng không apply/clone được
- Khi bấm vào template VIP thì hiện luồng nâng cấp

### 2. Thành phần editor kiểu Canva
Mở rộng thư viện thành phần với nhiều nhóm:
- Shapes
- Badges
- Quote blocks
- Timeline
- Stat cards
- CTA sections
- Social/logo chips
- Tables
- Infographic blocks
- Chart/info blocks
- Dividers
- Image frames
- Grids/layout blocks
- Mockup blocks
- Icon cards
- Decorative stickers

Yêu cầu:
- Thành phần thêm được ngay vào Fabric canvas
- Sau khi thêm vẫn editable
- Có phân nhóm rõ
- Một số nhóm nâng cao là VIP

### 3. VIP / Pricing UI
Làm UI nâng cấp đẹp kiểu pricing cards:
- Free
- VIP

Hiện các quyền lợi như:
- dùng template premium
- dùng template dài trên 10 trang
- dùng component cao cấp
- các quyền lợi editor nâng cao nếu phù hợp

### 4. Thanh toán VietQR
Khi user bấm nâng cấp:
- Tạo giao dịch có mã riêng
- Tạo QR thanh toán với:
  - Ngân hàng: MBBank
  - STK: 1111122005
  - Chủ tài khoản: Tran Minh Khang
- Lưu giao dịch vào database

Lưu ý:
- Nếu không có API/webhook ngân hàng thật, không được giả vờ auto biết giao dịch thành công
- Hãy làm luồng trung thực:
  - payment pending
  - màn hình QR + nội dung chuyển khoản
  - kiểm tra trạng thái
  - xác nhận nội bộ/admin nếu chưa có tích hợp ngân hàng thật
- Khi giao dịch được xác nhận thì nâng user lên VIP

## Backend cần có
- Field trong `User`:
  - `IsVip`
  - `VipExpiresAt`
  - `VipPlanName`
- Entity `PaymentTransaction`
- Logic chặn VIP ở backend
- User free không được apply template VIP
- User free không được dùng component VIP

## Frontend cần có
- Badge `VIP`
- Thông báo khóa tính năng thân thiện
- Nút nâng cấp rõ ràng
- Giao diện hiện đại, có cảm giác premium
- Không làm demo sơ sài

## Cách làm việc
- Đọc codebase trước khi sửa
- Ưu tiên sửa code trực tiếp
- Không dừng ở phân tích
- Sau khi sửa xong thì build nếu có thể
- Tạo migration nếu cần
- Nếu có phần nào chưa thể tự động hoàn tất vì thiếu API thực, ghi rõ

## File phải đọc trước
- `DoAnLtWeb/Program.cs`
- `DoAnLtWeb/Data/AppDbContext.cs`
- `DoAnLtWeb/Data/DbInitializer.cs`
- `DoAnLtWeb/Controllers/AccountController.cs`
- `DoAnLtWeb/Controllers/SlideController.cs`
- `DoAnLtWeb/Models/User.cs`
- `DoAnLtWeb/Models/Presentation.cs`
- `DoAnLtWeb/Views/Slide/Edit.cshtml`
- `DoAnLtWeb/wwwroot/js/slide-editor.js`

## Yêu cầu cuối
Hãy implement trọn gói phần còn dở:
1. VIP templates
2. VIP components
3. pricing UI
4. VietQR payment flow
5. PaymentTransaction database model
6. nâng user lên VIP sau xác nhận thanh toán
7. component library kiểu Canva
8. migration
9. build/kiểm tra nếu làm được

Không dừng ở phân tích. Hãy sửa code trực tiếp.