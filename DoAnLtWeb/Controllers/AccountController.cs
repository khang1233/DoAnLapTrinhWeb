using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using DoAnLtWeb.Models;
using System.Security.Claims;

namespace DoAnLtWeb.Controllers
{
    public class AccountController : Controller
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        public AccountController(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpGet]
        public IActionResult Login()
        {
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home"); // Chuyển về Dashboard
            }
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user != null)
                {
                    // Check if password hash is present and starts with $ (standard BCrypt hash formats start with $2a$, $2b$, $2y$, etc.)
                    bool isBcrypt = !string.IsNullOrEmpty(user.PasswordHash) && user.PasswordHash.StartsWith("$");

                    if (isBcrypt)
                    {
                        if (BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                        {
                            // Upgrade to ASP.NET Core Identity PBKDF2 hash format
                            user.PasswordHash = _userManager.PasswordHasher.HashPassword(user, model.Password);
                            await _userManager.UpdateAsync(user);
                            await _signInManager.SignInAsync(user, isPersistent: true);
                            return RedirectToAction("Index", "Home");
                        }
                    }
                    else
                    {
                        var result = await _signInManager.PasswordSignInAsync(user, model.Password, isPersistent: true, lockoutOnFailure: false);
                        if (result.Succeeded)
                        {
                            return RedirectToAction("Index", "Home");
                        }
                    }
                }
                
                ModelState.AddModelError(string.Empty, "Email hoặc Mật khẩu không chính xác.");
            }

            return View(model);
        }

        [HttpGet]
        public IActionResult Register()
        {
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null)
                {
                    ModelState.AddModelError("Email", "Email này đã được sử dụng.");
                    return View(model);
                }

                var user = new User
                {
                    Username = model.Username,
                    Email = model.Email
                };

                var result = await _userManager.CreateAsync(user, model.Password);
                if (result.Succeeded)
                {
                    await _signInManager.SignInAsync(user, isPersistent: true);
                    return RedirectToAction("Index", "Home");
                }

                // Đăng nhập tự động sau khi đăng ký
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
            }

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ExternalLogin(string provider, string? returnUrl = null)
        {
            var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Account", new { returnUrl });
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
            return Challenge(properties, provider);
        }

        [HttpGet]
        public async Task<IActionResult> ExternalLoginCallback(string? returnUrl = null, string? remoteError = null)
        {
            returnUrl ??= Url.Content("~/");

            if (remoteError != null)
            {
                ModelState.AddModelError(string.Empty, $"Lỗi đăng nhập Google: {remoteError}");
                return View("Login", new LoginViewModel());
            }

            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                ModelState.AddModelError(string.Empty, "Không lấy được thông tin đăng nhập Google.");
                return View("Login", new LoginViewModel());
            }

            var signInResult = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: true);
            if (signInResult.Succeeded)
            {
                return LocalRedirect(returnUrl);
            }

            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrWhiteSpace(email))
            {
                ModelState.AddModelError(string.Empty, "Tài khoản Google chưa cung cấp email.");
                return View("Login", new LoginViewModel());
            }

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new User
                {
                    Email = email,
                    Username = info.Principal.FindFirstValue(ClaimTypes.Name) ?? email
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    foreach (var error in createResult.Errors)
                    {
                        ModelState.AddModelError(string.Empty, error.Description);
                    }
                    return View("Login", new LoginViewModel());
                }
            }

            var addLoginResult = await _userManager.AddLoginAsync(user, info);
            if (!addLoginResult.Succeeded && !addLoginResult.Errors.Any(e => e.Code == "LoginAlreadyAssociated"))
            {
                foreach (var error in addLoginResult.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
                return View("Login", new LoginViewModel());
            }

            await _signInManager.SignInAsync(user, isPersistent: true);
            return LocalRedirect(returnUrl);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Login", "Account");
        }
    }
}
