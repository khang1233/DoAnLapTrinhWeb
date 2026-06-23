using System.ComponentModel.DataAnnotations;

namespace DoAnLtWeb.Models
{
    public class VipPlanViewModel
    {
        public string PlanName { get; set; } = "VIP Monthly";
        public decimal Amount { get; set; }
        public string PriceLabel { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsRecommended { get; set; }
        public List<string> Features { get; set; } = new();
    }

    public class CreateVipPaymentRequest
    {
        [Required]
        public string PlanName { get; set; } = "VIP Monthly";
    }
}
