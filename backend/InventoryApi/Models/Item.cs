namespace InventoryApi.Models
{
    public class Item
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string It_Name { get; set; } = string.Empty;
        public int Category_Id { get; set; }
        public int? Brand_Id { get; set; }
        public decimal Threshold { get; set; }
        public int UnitOfMeasureId { get; set; }
        public decimal CurrentQuantity { get; set; }
        public bool Flag { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }

        // Joined Display Names
        public string? Category { get; set; } = string.Empty;
        public string? Brand { get; set; } = string.Empty;
        public string? UnitOfMeasureName { get; set; } = string.Empty;
        public bool UnitOfMeasureAllowsDecimal { get; set; }

    }
}
