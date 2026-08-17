namespace InventoryApi.Models.Dtos
{
    public class GroceryListDtos
    {
        public class CreateGroceryListDto
        {
            public string? Name { get; set; }
        }

        public class AddGroceryListItemDto 

        {
            public int ItemId { get; set; }
            public decimal QuantityNeeded { get; set; } = 1;
            public decimal? EstimatedPrice { get; set; }
        }

        public class UpdateGroceryListItemDto
        {
            public decimal? QuantityNeeded { get; set; }
            public decimal? EstimatedPrice { get; set; }
        }
    }


}
