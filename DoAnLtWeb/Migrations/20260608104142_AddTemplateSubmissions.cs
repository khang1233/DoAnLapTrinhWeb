using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoAnLtWeb.Migrations
{
    /// <inheritdoc />
    public partial class AddTemplateSubmissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TemplateSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    PresentationId = table.Column<int>(type: "int", nullable: false),
                    ProposedTitle = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    ProposedCategory = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    AdminNote = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemplateSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemplateSubmissions_Presentations_PresentationId",
                        column: x => x.PresentationId,
                        principalTable: "Presentations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TemplateSubmissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TemplateSubmissions_PresentationId",
                table: "TemplateSubmissions",
                column: "PresentationId");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateSubmissions_Status",
                table: "TemplateSubmissions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TemplateSubmissions_UserId",
                table: "TemplateSubmissions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TemplateSubmissions");
        }
    }
}
