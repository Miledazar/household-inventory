namespace InventoryApi.Models
{
    public class Category
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public string Cat_Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
