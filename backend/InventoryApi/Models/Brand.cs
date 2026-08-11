namespace InventoryApi.Models
{
    public class Brand
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Br_Name { get; set; } = string.Empty;
    }
}
