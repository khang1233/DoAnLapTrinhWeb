using System;
using System.Collections.Generic;

namespace DoAnLtWeb.Models
{
    public class Presentation
    {
        public int Id { get; set; }
        public string Title { get; set; } = "Untitled Presentation";
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsTemplate { get; set; } = false;
        public string Category { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = "";
        
        public ICollection<Slide> Slides { get; set; } = new List<Slide>();
    }
}
