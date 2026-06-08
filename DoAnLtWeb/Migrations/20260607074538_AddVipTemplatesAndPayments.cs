using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoAnLtWeb.Migrations
{
    /// <inheritdoc />
    public partial class AddVipTemplatesAndPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsVip",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "VipExpiresAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VipPlanName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsPremiumTemplate",
                table: "Presentations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PremiumReason",
                table: "Presentations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "PaymentTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    PaymentCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PlanName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AccountNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AccountName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TransferContent = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    VietQrUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_PaymentCode",
                table: "PaymentTransactions",
                column: "PaymentCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_UserId",
                table: "PaymentTransactions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaymentTransactions");

            migrationBuilder.DropColumn(
                name: "IsVip",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "VipExpiresAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "VipPlanName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsPremiumTemplate",
                table: "Presentations");

            migrationBuilder.DropColumn(
                name: "PremiumReason",
                table: "Presentations");
        }
    }
}
