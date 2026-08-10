namespace InventoryApi.Models
{
    public class ItemBrand
    {
        public int ItemId { get; set; }
        public int BrandId { get; set; }
        public string Status { get; set; } = "Neutral";
        public string? Reason { get; set; }
    }
}
