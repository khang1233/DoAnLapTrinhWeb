using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using DoAnLtWeb.Data;
using DoAnLtWeb.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAnLtWeb.Controllers
{
    // Webhook endpoint for SePay (sepay.vn) — auto-confirms VIP payments when a matching
    // bank transfer lands. Configure in appsettings.json under "SePay":
    //   "ApiToken": "..."                — token configured at SePay → Webhooks → Header `Authorization: Apikey <token>`
    //   "PaymentCodePrefix": "SLIDIFY"   — must match the prefix used in BillingController.CreatePayment
    //
    // Manual admin confirmation in BillingController.ConfirmPayment stays as fallback.
    [ApiController]
    [Route("api/payment/webhook")]
    [AllowAnonymous]
    public class PaymentWebhookController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly ILogger<PaymentWebhookController> _logger;

        public PaymentWebhookController(AppDbContext context, IConfiguration config, ILogger<PaymentWebhookController> logger)
        {
            _context = context;
            _config = config;
            _logger = logger;
        }

        [HttpPost("sepay")]
        public async Task<IActionResult> SePay([FromBody] SePayPayload payload)
        {
            // Auth: SePay sends "Authorization: Apikey <token>". The community Laravel package
            // sometimes prepends "Bearer ", so accept that variant too.
            var configured = _config["SePay:ApiToken"];
            var rawHeader = Request.Headers["Authorization"].ToString().Trim();
            _logger.LogInformation("SePay webhook hit. AuthHeaderPresent={Present} ContentLen={Len}",
                !string.IsNullOrEmpty(rawHeader), rawHeader.Length);

            if (!string.IsNullOrWhiteSpace(configured))
            {
                // Normalise: strip optional "Bearer " prefix, then require "Apikey <token>".
                var header = rawHeader;
                if (header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                    header = header.Substring(7).Trim();

                var expected = $"Apikey {configured}";
                // Constant-time compare — but ONLY when lengths match. Otherwise just reject.
                var headerBytes = Encoding.UTF8.GetBytes(header);
                var expectedBytes = Encoding.UTF8.GetBytes(expected);
                var ok = headerBytes.Length == expectedBytes.Length &&
                         CryptographicOperations.FixedTimeEquals(headerBytes, expectedBytes);
                if (!ok)
                {
                    _logger.LogWarning("SePay webhook auth fail. Got header (len={Len}) — expected len={ExpLen}",
                        header.Length, expected.Length);
                    return Unauthorized(new { ok = false, reason = "bad-token" });
                }
            }
            if (payload == null)
            {
                _logger.LogWarning("SePay webhook: empty payload");
                return BadRequest(new { ok = false, reason = "empty" });
            }

            _logger.LogInformation("SePay webhook payload: id={Id} type={Type} amount={Amount} content='{Content}' desc='{Desc}'",
                payload.Id, payload.TransferType, payload.TransferAmount, payload.Content, payload.Description);

            if (!string.Equals(payload.TransferType, "in", StringComparison.OrdinalIgnoreCase))
            {
                return Ok(new { ok = true, ignored = "outgoing-transfer" });
            }

            // Build a normalised search blob from BOTH content and description, because banks split
            // payment notes across either field depending on the channel.
            var content = ((payload.Content ?? string.Empty) + " " + (payload.Description ?? string.Empty))
                .ToUpperInvariant();
            var normContent = NormaliseAlnum(content);

            var pending = await _context.PaymentTransactions
                .Include(p => p.User)
                .Where(p => p.Status == "Pending")
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            _logger.LogInformation("SePay webhook: scanning {N} pending payments for match", pending.Count);

            PaymentTransaction? payment = null;
            foreach (var p in pending)
            {
                var normTransfer = NormaliseAlnum(p.TransferContent ?? string.Empty);
                if (normTransfer.Length >= 4 && normContent.Contains(normTransfer))
                {
                    payment = p;
                    _logger.LogInformation("SePay webhook: matched payment {Code} (user {UserId})",
                        p.PaymentCode, p.UserId);
                    break;
                }
            }

            if (payment == null)
            {
                _logger.LogWarning("SePay webhook: no matching pending payment. normContent='{Norm}'", normContent);
                return Ok(new { ok = true, matched = false, reason = "no-match" });
            }

            // Sanity check amount (>= expected; allow over-pay).
            if (payment.Amount > 0 && payload.TransferAmount < payment.Amount)
            {
                payment.Note = $"Thiếu tiền: nhận {payload.TransferAmount}, cần {payment.Amount}.";
                await _context.SaveChangesAsync();
                _logger.LogWarning("SePay webhook: insufficient. expected={Expected} got={Got}",
                    payment.Amount, payload.TransferAmount);
                return Ok(new { ok = true, matched = true, reason = "insufficient" });
            }

            payment.Status = "Confirmed";
            payment.ConfirmedAt = DateTime.UtcNow;
            payment.Note = $"Tự xác nhận qua SePay. Ref: {payload.ReferenceCode}";

            if (payment.User != null)
            {
                payment.User.IsVip = true;
                payment.User.VipPlanName = payment.PlanName;
                payment.User.VipExpiresAt = DateTime.UtcNow.AddDays(30);
            }
            await _context.SaveChangesAsync();
            _logger.LogInformation("SePay webhook: confirmed payment {Code} for user {UserId}",
                payment.PaymentCode, payment.UserId);
            return Ok(new { ok = true, matched = true, confirmed = true });
        }

        private static string NormaliseAlnum(string s)
        {
            if (string.IsNullOrEmpty(s)) return string.Empty;
            var arr = s.Where(char.IsLetterOrDigit).Select(char.ToUpperInvariant).ToArray();
            return new string(arr);
        }

        public class SePayPayload
        {
            [JsonPropertyName("id")] public long Id { get; set; }
            [JsonPropertyName("gateway")] public string Gateway { get; set; } = string.Empty;
            [JsonPropertyName("transactionDate")] public string TransactionDate { get; set; } = string.Empty;
            [JsonPropertyName("accountNumber")] public string AccountNumber { get; set; } = string.Empty;
            [JsonPropertyName("content")] public string Content { get; set; } = string.Empty;
            [JsonPropertyName("transferType")] public string TransferType { get; set; } = string.Empty;
            [JsonPropertyName("description")] public string Description { get; set; } = string.Empty;
            [JsonPropertyName("transferAmount")] public decimal TransferAmount { get; set; }
            [JsonPropertyName("referenceCode")] public string ReferenceCode { get; set; } = string.Empty;
        }
    }
}
