using DoAnLtWeb.Data;
using DoAnLtWeb.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoAnLtWeb.Controllers
{
    [Authorize]
    public class BillingController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;

        private static readonly List<VipPlanViewModel> Plans = new()
        {
            new VipPlanViewModel
            {
                PlanName = "Free",
                Amount = 0,
                PriceLabel = "0 VND",
                Description = "Goi co ban de tao va chinh sua slide thong thuong.",
                Features = new List<string>
                {
                    "Template co ban",
                    "Thanh phan tieu chuan",
                    "Chinh sua slide khong gioi han"
                }
            },
            new VipPlanViewModel
            {
                PlanName = "VIP Monthly",
                Amount = 10000,
                PriceLabel = "10.000 VND / tháng",
                Description = "Mở khóa template premium, bộ thành phần nâng cao và trải nghiệm editor cao cấp.",
                IsRecommended = true,
                Features = new List<string>
                {
                    "Dùng template dài (từ 22 slide)",
                    "Mở khoá template premium và dashboard cao cấp",
                    "Thêm thành phần VIP: timeline, stat card, mockup, infographic",
                    "Xác nhận thanh toán tự động qua SePay"
                }
            }
        };

        public BillingController(AppDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> Upgrade()
        {
            var user = await GetCurrentUserAsync();
            ViewBag.IsVip = user?.IsVip == true && (!user.VipExpiresAt.HasValue || user.VipExpiresAt > DateTime.UtcNow);
            ViewBag.CurrentPlan = user?.VipPlanName ?? "Free";
            return View(Plans);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreatePayment(CreateVipPaymentRequest request)
        {
            var user = await GetCurrentUserAsync();
            if (user == null) return Unauthorized();

            var selectedPlan = Plans.FirstOrDefault(p => p.PlanName == request.PlanName && p.Amount > 0);
            if (selectedPlan == null)
            {
                TempData["BillingError"] = "Gói VIP không hợp lệ.";
                return RedirectToAction(nameof(Upgrade));
            }

            // Transfer content = user email, sanitised so VietQR/SePay receive a clean ASCII token.
            // SePay still matches by exact-text search so we keep the email format readable.
            var sanitisedEmail = SanitiseEmailForTransfer(user.Email ?? string.Empty);
            // PaymentCode kept unique per attempt (timestamp + userId) for our own tracking,
            // but the transferContent is just the email so users see something they recognise on the QR.
            var paymentCode = $"VIP{DateTime.UtcNow:yyMMddHHmmss}{user.Id}";
            var transferContent = sanitisedEmail;
            var amountText = decimal.ToInt32(selectedPlan.Amount).ToString();
            var encodedName = Uri.EscapeDataString("Tran Minh Khang");
            var encodedInfo = Uri.EscapeDataString(transferContent);
            var qrUrl = $"https://img.vietqr.io/image/mb-1111122005-compact2.png?amount={amountText}&addInfo={encodedInfo}&accountName={encodedName}";

            var payment = new PaymentTransaction
            {
                UserId = user.Id,
                PaymentCode = paymentCode,
                PlanName = selectedPlan.PlanName,
                Amount = selectedPlan.Amount,
                Status = "Pending",
                TransferContent = transferContent,
                VietQrUrl = qrUrl,
                Note = "Chờ xác nhận thanh toán từ SePay hoặc admin."
            };

            _context.PaymentTransactions.Add(payment);
            await _context.SaveChangesAsync();

            return RedirectToAction(nameof(Payment), new { id = payment.Id });
        }

        // SePay's webhook matches on exact substring in transfer content. Bank systems often strip
        // "@" and other punctuation, so we replace them with spaces — the email user-part still survives
        // and remains unique enough to identify the user.
        private static string SanitiseEmailForTransfer(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return string.Empty;
            // Replace @ and . with spaces, keep alphanumerics. e.g. user@gmail.com -> "user gmail com"
            var chars = email.Select(c => char.IsLetterOrDigit(c) ? c : ' ').ToArray();
            var s = new string(chars);
            while (s.Contains("  ")) s = s.Replace("  ", " ");
            return s.Trim().ToUpperInvariant();
        }

        [HttpGet]
        public async Task<IActionResult> Payment(int id)
        {
            var user = await GetCurrentUserAsync();
            if (user == null) return Unauthorized();

            var payment = await _context.PaymentTransactions.FirstOrDefaultAsync(p => p.Id == id && p.UserId == user.Id);
            if (payment == null) return NotFound();

            return View(payment);
        }

        [HttpGet]
        public async Task<IActionResult> PaymentStatus(int id)
        {
            var user = await GetCurrentUserAsync();
            if (user == null) return Unauthorized();

            var payment = await _context.PaymentTransactions.FirstOrDefaultAsync(p => p.Id == id && p.UserId == user.Id);
            if (payment == null) return NotFound();

            return Json(new
            {
                payment.Id,
                payment.Status,
                payment.PlanName,
                payment.Amount,
                payment.TransferContent,
                payment.PaymentCode,
                payment.BankName,
                payment.AccountNumber,
                payment.AccountName,
                payment.VietQrUrl,
                expiresAt = payment.ExpiresAt,
                isVip = user.IsVip,
                vipExpiresAt = user.VipExpiresAt
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MarkPaid(int id)
        {
            var user = await GetCurrentUserAsync();
            if (user == null) return Unauthorized();

            var payment = await _context.PaymentTransactions.FirstOrDefaultAsync(p => p.Id == id && p.UserId == user.Id);
            if (payment == null) return NotFound();

            if (payment.Status == "Pending")
            {
                payment.Status = "Submitted";
                payment.Note = "Nguoi dung da bao thanh toan. Dang cho xac nhan.";
                await _context.SaveChangesAsync();
            }

            TempData["BillingInfo"] = "Yeu cau xac nhan thanh toan da duoc gui. Khi admin xac nhan, tai khoan se len VIP.";
            return RedirectToAction(nameof(Payment), new { id });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ConfirmPayment(int id)
        {
            var user = await GetCurrentUserAsync();
            if (user == null) return Unauthorized();

            var isAdmin = User.IsInRole("Admin") || user.Email == "admin@gmail.com";
            if (!isAdmin) return Forbid();

            var payment = await _context.PaymentTransactions.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
            if (payment == null) return NotFound();

            if (payment.Status != "Confirmed")
            {
                payment.Status = "Confirmed";
                payment.ConfirmedAt = DateTime.UtcNow;
                payment.Note = "Thanh toan da duoc xac nhan.";

                if (payment.User != null)
                {
                    payment.User.IsVip = true;
                    payment.User.VipPlanName = payment.PlanName;
                    payment.User.VipExpiresAt = DateTime.UtcNow.AddDays(30);
                }

                await _context.SaveChangesAsync();
            }

            TempData["BillingInfo"] = "Thanh toan da duoc xac nhan. Tai khoan da len VIP.";
            return RedirectToAction(nameof(Upgrade));
        }

        private async Task<User?> GetCurrentUserAsync()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId)) return null;
            return await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }
    }
}
