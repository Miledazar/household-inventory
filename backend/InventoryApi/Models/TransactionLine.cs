namespace InventoryApi.Models
{
    public class TransactionLine
    {
        public int Id { get; set; }
        public int TransactionId { get; set; }
        public int ItemId { get; set; }
        public int? BrandId { get; set; }
        public decimal Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
    }
}
