using System.Text.Json.Serialization;

namespace DoAnLtWeb.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
        
        public List<Project> Projects { get; set; } = new();
    }
}
