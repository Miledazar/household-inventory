namespace InventoryApi.Models.Dtos
{
    public class DashboardSummaryDto
    {
        public decimal TotalSpent { get; set; }
        public decimal CurrentStockValue { get; set; }
        public decimal WasteValue { get; set; }
    }

    public class LowStockItemDto
    {
        public int ItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal CurrentQuantity { get; set; }
        public decimal Threshold { get; set; }
        public string UnitOfMeasure { get; set; } = string.Empty;
        public string? BrandName { get; set; } 
    }

    public class ExpiringBatchDto
    {
        public int BatchId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public decimal RemainingQuantity { get; set; }
        public string UnitOfMeasure { get; set; } = string.Empty;
        public DateTime ExpirationDate { get; set; }
        public string? BrandName { get; set; }
    }

    public class CategorySpendingDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal TotalSpent { get; set; }
    }
}