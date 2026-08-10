namespace InventoryApi.Models
{
    public class Item
    {
        public int Id { get; set; }
        public string It_Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public decimal Threshold { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
