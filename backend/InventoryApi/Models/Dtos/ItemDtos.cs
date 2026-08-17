namespace InventoryApi.Models.Dtos
{
    public class CreateItemDto
    {
        public string Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public int? BrandId { get; set; }
        public decimal Threshold { get; set; }
        public string UnitOfMeasure { get; set; } = "Piece";
        public bool Flag { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateItemDto
    {
        public string Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public int? BrandId { get; set; }
        public decimal Threshold { get; set; }
        public string UnitOfMeasure { get; set; } = "Piece";
        public bool Flag { get; set; }
        public string? Notes { get; set; }
    }
}
