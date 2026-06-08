# Session handoff - DoAnLtWeb

Doc nay dung de session moi doc truoc khi lam viec, tranh phai quet lai ca codebase. Neu can tiep tuc review/code, hay mo file nay truoc roi chi doc them file lien quan.

## Tong quan nhanh

- Repo: `c:\Users\khang\source\repos\DoAnLtWeb`
- Solution: `DoAnLtWeb.sln`
- App chinh: `DoAnLtWeb/DoAnLtWeb.csproj`
- Stack: ASP.NET Core MVC .NET 8, EF Core SQL Server, ASP.NET Core Identity int key, Razor Views, static JS/CSS trong `wwwroot`.
- Package dang dung: Identity, Google auth, EF Core SQL Server/Tools, BCrypt, Docnet.Core, ImageSharp.
- Program entry: `DoAnLtWeb/Program.cs`

## Cach chay / cau hinh

- Connection string doc tu `appsettings.json` key `ConnectionStrings:DefaultConnection`.
- Google OAuth doc tu `Authentication:Google:ClientId` va `Authentication:Google:ClientSecret`; neu thieu thi app set dummy de khoi crash luc start.
- Cookie login path: `/Account/Login`, logout `/Account/Logout`.
- Static files phuc vu tu `wwwroot`.
- Sau khi build app, `DbInitializer.Initialize(services)` duoc goi de seed data.

Lenh hay dung:

```powershell
dotnet build DoAnLtWeb.sln
dotnet ef migrations add <Name> --project DoAnLtWeb
dotnet ef database update --project DoAnLtWeb
```

## Kien truc thu muc quan trong

- `DoAnLtWeb/Controllers/`: MVC controllers.
- `DoAnLtWeb/Models/`: entity va view model.
- `DoAnLtWeb/Data/AppDbContext.cs`: DbContext + IdentityDbContext.
- `DoAnLtWeb/Data/DbInitializer.cs`: seed templates/users/data.
- `DoAnLtWeb/Migrations/`: EF migrations.
- `DoAnLtWeb/Views/`: Razor pages/views.
- `DoAnLtWeb/wwwroot/js/slide-editor.js`: logic editor chinh.
- `DoAnLtWeb/wwwroot/js/slidify-vip-components.js`: thanh phan VIP/editor nang cao.
- `DoAnLtWeb/wwwroot/css/styles.css` va `site.css`: style app.
- `DoAnLtWeb/wwwroot/examples`, `uploads`, `decks`, `slide-mau`: nhieu asset/template, rat lon; tranh doc het neu khong can.

## Entities / DbContext

`AppDbContext` ke thua `IdentityDbContext<User, IdentityRole<int>, int>`.
DbSet chinh:

- `Projects`
- `Presentations`
- `Slides`
- `PaymentTransactions`

Mapping dang chu y:

- `User` map table `Users`.
- `Presentation` has many `Slides`, delete cascade.
- `PaymentTransaction` belongs to `User`, delete cascade.
- `PaymentTransaction.PaymentCode` co unique index.

## Models quan trong

- `User.cs`: Identity user custom. Co cac truong VIP nhu `IsVip`, `VipPlanName`, `VipExpiresAt`, va navigation `PaymentTransactions`.
- `Presentation.cs`: bai thuyet trinh/template. Co `IsTemplate`, `Category`, `ThumbnailUrl`, `IsPremiumTemplate`, `PremiumReason`, `Slides`.
- `Slide.cs`: slide con, chua `PageNumber`, `BackgroundColor`, `BackgroundImage`, `ElementsJson`.
- `PresentationSaveDto.cs`: payload luu editor.
- `PaymentTransaction.cs`: giao dich VIP/VietQR. Default bank MBBank, account `1111122005`, account name `Tran Minh Khang`, status default `Pending`, expires sau 12h.
- `VipPlanViewModels.cs`: view model cho trang upgrade/payment.
- `AuthViewModels.cs`: login/register view models.

## Controllers chinh

### AccountController

- Xu ly login/register/logout/Google login.
- Dung ASP.NET Identity `UserManager`, `SignInManager`.

### HomeController

- Trang chu/index/privacy/error.
- Thuong lay danh sach presentation/template de render trang chu.

### SlideController

- `[Authorize]`.
- `Create`: tao presentation moi voi 1 slide trang.
- `CloneTemplate`: clone template; neu template premium va user khong VIP thi redirect `Billing/Upgrade`.
- `GetTemplates`: tra JSON templates, loc bot title rac co pattern `[...]` va keyword China/CQU/Telecom/CMB/Chongqing.
- `Edit`: mo editor, set `ViewBag.IsVip`.
- `SavePresentation`: luu title, thumbnail, xoa/recreate slides tu payload.
- `UploadImage`: upload vao `wwwroot/uploads`.

### BillingController

- `[Authorize]`.
- Plan hard-code hien co: Free va `VIP Monthly` 99.000 VND/thang.
- `Upgrade`: trang nang cap.
- `CreatePayment`: tao `PaymentTransaction`, payment code dang `VIP{yyMMddHHmmss}{userId}`, transfer content `SLIDIFY <code>`, tao VietQR URL qua `https://img.vietqr.io/image/mb-1111122005-compact2.png?...`.
- `Payment`: xem giao dich cua user.
- `PaymentStatus`: JSON status.
- `MarkPaid`: user bao da chuyen khoan, status `Submitted`.
- `ConfirmPayment`: chi admin gia lap theo email `admin@slidify.com` hoac username co `Admin`; set status `Confirmed`, set user VIP 30 ngay.

### AdminController

- Quan tri dashboard/templates/payments/import PPTX. File dang untracked theo git status, nen coi nhu thay doi moi cua user/session truoc.

## Views / frontend dang chu y

- `Views/Slide/Edit.cshtml`: UI editor.
- `Views/Billing/Upgrade.cshtml`, `Views/Billing/Payment.cshtml`: luong VIP/VietQR.
- `Views/Admin/*.cshtml`: dashboard, templates, payments, import.
- `Views/Shared/_Layout.cshtml`: layout chung.
- `wwwroot/js/slide-editor.js`: neu sua editor thi doc file nay truoc.
- `wwwroot/js/slidify-vip-components.js`: logic component VIP.

## Asset/template lon - can tranh doc het

Cac folder sau rat nhieu file anh/svg/pptx, chi doc khi task lien quan truc tiep:

- `DoAnLtWeb/wwwroot/uploads/`
- `DoAnLtWeb/wwwroot/uploads/imported/`
- `DoAnLtWeb/wwwroot/examples/`
- `DoAnLtWeb/wwwroot/decks/`
- `DoAnLtWeb/wwwroot/slide-mau/`
- `DoAnLtWeb/wwwroot/lib/`

## Tinh trang git luc tao file nay

`git status --short` luc do bao co san nhieu thay doi, khong phai do file nay tao:

- Modified khoang 19 files, gom `Controllers/AccountController.cs`, `Controllers/HomeController.cs`, `Controllers/SlideController.cs`, `Data/AppDbContext.cs`, `Data/DbInitializer.cs`, `DoAnLtWeb.csproj`, migrations snapshot, `Models/Presentation.cs`, `Models/User.cs`, `Program.cs`, va nhieu file khac.
- Untracked khoang 28 entries, gom `DoAnLtWeb/.codex/`, `.codex_bin/`, `.github/`, `Controllers/AdminController.cs`, `Controllers/BillingController.cs`, `MarkItDownTool/`, migrations Identity/VIP, view/css/js/model moi, v.v.

Luu y: dung git diff/status can than, dung revert/reset neu khong duoc yeu cau.

## Viec nen lam trong session moi

1. Doc file nay truoc.
2. Neu can review Payment/VIP, doc tiep: `Models/PaymentTransaction.cs`, `Controllers/BillingController.cs`, `Views/Billing/Payment.cshtml`, `Views/Admin/Payments.cshtml`, `Data/AppDbContext.cs`, migration `20260607074538_AddVipTemplatesAndPayments*`.
3. Neu can editor/template, doc tiep: `Controllers/SlideController.cs`, `Views/Slide/Edit.cshtml`, `wwwroot/js/slide-editor.js`, `wwwroot/js/slidify-vip-components.js`, `Data/DbInitializer.cs`.
4. Neu can auth/login, doc tiep: `Program.cs`, `Models/User.cs`, `Controllers/AccountController.cs`, migration Identity.
5. Khi search, uu tien `rg` va gioi han vao `DoAnLtWeb/Controllers`, `Models`, `Views`, `Data`, `wwwroot/js`, `wwwroot/css`; tranh search rong qua asset folders.

## Ghi chu ngan cho yeu cau hien tai

User muon co 1 file `.md` de session moi doc lai sau khi review xong, de khong can doc lai toan bo codebase. File nay duoc tao cho muc dich do.
