namespace InventoryApi.Models
{
    public class Item
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string It_Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public decimal Threshold { get; set; }
        public decimal CurrentQuantity { get; set; }
        public bool Flag { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
