namespace InventoryApi.Models
{
    public class InventoryBatch
    {
        public int Id { get; set; }
        public int ItemId { get; set; }
        public int TransactionLineId { get; set; }
        public decimal PurchasedQuantity { get; set; }
        public decimal RemainingQuantity { get; set; }
        public decimal? UnitPrice { get; set; }
        public DateTime PurchaseDate { get; set; }
        public DateTime? ExpirationDate { get; set; }
    }
}
