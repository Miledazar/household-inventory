namespace InventoryApi.Models
{
    public class GroceryListItem
    {
        public int Id { get; set; }
        public int GroceryListId { get; set; }
        public int ItemId { get; set; }
        public decimal QuantityNeeded { get; set; }
        public decimal? EstimatedPrice { get; set; }
        public bool IsChecked { get; set; }
    }
}
