using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoAnLtWeb.Controllers
{
    // Proxies search queries to the Unsplash API so we don't expose the access key to the browser.
    // Configure the key in appsettings.json -> "Unsplash:AccessKey".
    // Without a key, we fall back to Unsplash Source (no rate limit, but no search — just random pic).
    [ApiController]
    [Route("api/photos")]
    [Authorize]
    public class PhotosController : ControllerBase
    {
        private static readonly HttpClient _http = new();
        private readonly IConfiguration _config;
        private readonly ILogger<PhotosController> _logger;

        public PhotosController(IConfiguration config, ILogger<PhotosController> logger)
        {
            _config = config;
            _logger = logger;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q = "business", [FromQuery] int page = 1, [FromQuery] int perPage = 24)
        {
            if (string.IsNullOrWhiteSpace(q)) q = "business";
            perPage = Math.Clamp(perPage, 6, 30);
            page = Math.Clamp(page, 1, 20);

            var key = _config["Unsplash:AccessKey"];
            if (string.IsNullOrWhiteSpace(key))
            {
                // No key configured -> hand back a deterministic spread of Unsplash Source URLs so
                // the gallery still works. Each URL includes the query as a seed so results stay
                // varied across pages.
                var seedBase = (q + page).GetHashCode();
                var results = Enumerable.Range(0, perPage).Select(i =>
                {
                    var sig = unchecked((uint)(seedBase + i * 9973));
                    return new
                    {
                        id = $"src-{sig}",
                        thumb = $"https://source.unsplash.com/300x300/?{Uri.EscapeDataString(q)}&sig={sig}",
                        full = $"https://source.unsplash.com/1280x720/?{Uri.EscapeDataString(q)}&sig={sig}",
                        author = "Unsplash Source",
                        authorUrl = "https://unsplash.com"
                    };
                });
                return Ok(new { ok = true, source = "unsplash-source", results });
            }

            try
            {
                var url = $"https://api.unsplash.com/search/photos?query={Uri.EscapeDataString(q)}&page={page}&per_page={perPage}&content_filter=high";
                using var req = new HttpRequestMessage(HttpMethod.Get, url);
                req.Headers.Add("Authorization", $"Client-ID {key}");
                req.Headers.Add("Accept-Version", "v1");
                using var resp = await _http.SendAsync(req);
                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Unsplash API returned {Status} for query '{Query}'", resp.StatusCode, q);
                    return Ok(new { ok = false, source = "unsplash", reason = resp.StatusCode.ToString() });
                }
                var json = await resp.Content.ReadAsStringAsync();
                using var doc = System.Text.Json.JsonDocument.Parse(json);
                var results = doc.RootElement.GetProperty("results").EnumerateArray().Select(p => new
                {
                    id = p.GetProperty("id").GetString(),
                    thumb = p.GetProperty("urls").GetProperty("small").GetString(),
                    full = p.GetProperty("urls").GetProperty("regular").GetString(),
                    author = p.GetProperty("user").GetProperty("name").GetString(),
                    authorUrl = p.GetProperty("user").GetProperty("links").GetProperty("html").GetString()
                }).ToList();
                return Ok(new { ok = true, source = "unsplash", results });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unsplash search failed for query '{Query}'", q);
                return Ok(new { ok = false, source = "unsplash", reason = "exception" });
            }
        }
    }
}
