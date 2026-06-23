using System;
using System.ComponentModel.DataAnnotations;

namespace DoAnLtWeb.Models
{
    public enum SharePermission
    {
        // Read-only viewer: can open the editor but every save action is rejected.
        Viewer = 0,
        // Editor: can save changes. The owner still controls membership.
        Editor = 1
    }

    public class PresentationShare
    {
        public int Id { get; set; }

        // The presentation being shared.
        public int PresentationId { get; set; }
        public Presentation? Presentation { get; set; }

        // Stable token used in /Slide/Join/{token}. Generated once when the owner enables sharing.
        [Required, StringLength(64)]
        public string ShareToken { get; set; } = string.Empty;

        // The user who created the share (must be VIP at creation time). They are the "trưởng nhóm"
        // and they can kick / change permission on other members.
        public int OwnerUserId { get; set; }
        public User? OwnerUser { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Anyone with the link is admitted at this permission level. Owner can still kick.
        public SharePermission DefaultPermission { get; set; } = SharePermission.Editor;

        // When false the link stops admitting new members but existing members keep access.
        public bool IsActive { get; set; } = true;
    }

    public class PresentationShareMember
    {
        public int Id { get; set; }

        public int ShareId { get; set; }
        public PresentationShare? Share { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public SharePermission Permission { get; set; } = SharePermission.Editor;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}
