using System.ComponentModel.DataAnnotations.Schema;

namespace DoAnLtWeb.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SlideDataJson { get; set; } = "{}";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
