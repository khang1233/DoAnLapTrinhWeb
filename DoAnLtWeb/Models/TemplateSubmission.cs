using System;
using System.ComponentModel.DataAnnotations;

namespace DoAnLtWeb.Models
{
    public enum TemplateSubmissionStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }

    public class TemplateSubmission
    {
        public int Id { get; set; }

        // The user who proposed this presentation as a template.
        public int UserId { get; set; }
        public User? User { get; set; }

        // The presentation being proposed. We keep a soft FK (no cascade) so an admin
        // can keep the submission record around even if the user later deletes their draft.
        public int PresentationId { get; set; }
        public Presentation? Presentation { get; set; }

        [Required, StringLength(120)]
        public string ProposedTitle { get; set; } = string.Empty;

        [StringLength(80)]
        public string ProposedCategory { get; set; } = string.Empty;

        [StringLength(500)]
        public string Note { get; set; } = string.Empty;

        public TemplateSubmissionStatus Status { get; set; } = TemplateSubmissionStatus.Pending;

        [StringLength(300)]
        public string AdminNote { get; set; } = string.Empty;

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
    }
}
