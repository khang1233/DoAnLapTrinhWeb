using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoAnLtWeb.Migrations
{
    /// <inheritdoc />
    public partial class AddPresentationModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Presentations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsTemplate = table.Column<bool>(type: "bit", nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Presentations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Presentations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Slides",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PresentationId = table.Column<int>(type: "int", nullable: false),
                    PageNumber = table.Column<int>(type: "int", nullable: false),
                    BackgroundColor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BackgroundImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ElementsJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Slides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Slides_Presentations_PresentationId",
                        column: x => x.PresentationId,
                        principalTable: "Presentations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Presentations_UserId",
                table: "Presentations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Slides_PresentationId",
                table: "Slides",
                column: "PresentationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Slides");

            migrationBuilder.DropTable(
                name: "Presentations");
        }
    }
}
