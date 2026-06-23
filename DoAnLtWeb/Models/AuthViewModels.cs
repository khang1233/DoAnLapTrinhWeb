using System.ComponentModel.DataAnnotations;

namespace DoAnLtWeb.Models
{
    public class LoginViewModel
    {
        [Required(ErrorMessage = "Vui lòng nhập Email")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng nhập Mật khẩu")]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterViewModel
    {
        [Required(ErrorMessage = "Vui lòng nhập Tên hiển thị")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Tên phải từ 3 đến 50 ký tự")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng nhập Email")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng nhập Mật khẩu")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải chứa ít nhất 6 ký tự")]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;

        [DataType(DataType.Password)]
        [Display(Name = "Xác nhận mật khẩu")]
        [Compare("Password", ErrorMessage = "Mật khẩu xác nhận không khớp.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
