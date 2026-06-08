using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoAnLtWeb.Migrations
{
    /// <inheritdoc />
    public partial class AddTrashFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsTrashed",
                table: "Presentations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "TrashedAt",
                table: "Presentations",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsTrashed",
                table: "Presentations");

            migrationBuilder.DropColumn(
                name: "TrashedAt",
                table: "Presentations");
        }
    }
}
