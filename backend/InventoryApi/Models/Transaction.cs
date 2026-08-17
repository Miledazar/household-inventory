namespace InventoryApi.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Type { get; set; } = string.Empty;
        public  DateTime CreatedAt { get; set; }
        public string? Notes { get; set; }
        public int? StoreId { get; set; }
        public int? GroceryListId { get; set; }
    }
}
