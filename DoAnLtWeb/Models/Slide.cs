namespace DoAnLtWeb.Models
{
    public class Slide
    {
        public int Id { get; set; }
        public int PresentationId { get; set; }
        public Presentation? Presentation { get; set; }
        
        public int PageNumber { get; set; }
        public string BackgroundColor { get; set; } = "#ffffff";
        public string? BackgroundImage { get; set; }
        
        // Lưu trữ toàn bộ object Fabric.js của trang này dưới dạng mảng/chuỗi JSON
        public string ElementsJson { get; set; } = "[]";
    }
}
