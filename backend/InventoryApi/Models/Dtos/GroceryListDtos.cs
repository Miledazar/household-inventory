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
        }
    }


}
