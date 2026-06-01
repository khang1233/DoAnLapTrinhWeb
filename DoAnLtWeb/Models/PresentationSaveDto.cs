using System.Collections.Generic;

namespace DoAnLtWeb.Models
{
    public class PresentationSaveDto
    {
        public List<SlideDto> Slides { get; set; } = new List<SlideDto>();
    }

    public class SlideDto
    {
        public int Id { get; set; }
        public int PageNumber { get; set; }
        public string BackgroundColor { get; set; } = "#ffffff";
        public string? BackgroundImage { get; set; }
        public string ElementsJson { get; set; } = "[]";
    }
}
