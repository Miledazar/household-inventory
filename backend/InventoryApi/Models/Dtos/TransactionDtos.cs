namespace InventoryApi.Models.Dtos
{
    public class TransactionDtos
    {
        public class CreateTransactionDto
        {
            public string Type { get; set; } = string.Empty;
            public DateTime Date { get; set; }
            public string? Notes { get; set; }
            public int? StoreId { get; set; }
            public List<CreateTransactionLineDto> Lines { get; set; } = new();
        }

        public class CreateTransactionLineDto
        {
            public int ItemId { get; set; }
            public decimal Quantity { get; set; }
            public decimal? UnitPrice { get; set; }
        }
    }
}
