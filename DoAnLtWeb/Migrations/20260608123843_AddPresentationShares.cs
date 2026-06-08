using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoAnLtWeb.Migrations
{
    /// <inheritdoc />
    public partial class AddPresentationShares : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PresentationShares",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PresentationId = table.Column<int>(type: "int", nullable: false),
                    ShareToken = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    OwnerUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DefaultPermission = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PresentationShares", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PresentationShares_Presentations_PresentationId",
                        column: x => x.PresentationId,
                        principalTable: "Presentations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PresentationShares_Users_OwnerUserId",
                        column: x => x.OwnerUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PresentationShareMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShareId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Permission = table.Column<int>(type: "int", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PresentationShareMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PresentationShareMembers_PresentationShares_ShareId",
                        column: x => x.ShareId,
                        principalTable: "PresentationShares",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PresentationShareMembers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_PresentationShareMembers_ShareId_UserId",
                table: "PresentationShareMembers",
                columns: new[] { "ShareId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PresentationShareMembers_UserId",
                table: "PresentationShareMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PresentationShares_OwnerUserId",
                table: "PresentationShares",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PresentationShares_PresentationId",
                table: "PresentationShares",
                column: "PresentationId");

            migrationBuilder.CreateIndex(
                name: "IX_PresentationShares_ShareToken",
                table: "PresentationShares",
                column: "ShareToken",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PresentationShareMembers");

            migrationBuilder.DropTable(
                name: "PresentationShares");
        }
    }
}
