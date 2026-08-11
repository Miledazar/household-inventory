namespace InventoryApi.Models
{
    public class GroceryList
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? Gr_Name { get; set; }
        public string Status { get; set; } = "Active"; // 'Active' | 'Completed'
        public DateTime CreatedAt { get; set; }
    }
}
