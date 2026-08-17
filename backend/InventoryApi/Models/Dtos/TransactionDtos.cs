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
            public int? GroceryListId { get; set; }
            public List<CreateTransactionLineDto> Lines { get; set; } = new();
        }

        public class CreateTransactionLineDto
        {
            public int ItemId { get; set; }
            public decimal Quantity { get; set; }
            public decimal? UnitPrice { get; set; }
            public DateTime? ExpirationDate { get; set; }
            public int? BatchId { get; set; }
        }

        public class LinePlan
        {
            public CreateTransactionLineDto Line { get; set; } = null!;
            public List<BatchOperation> BatchOperations { get; set; } = new();
        }

        public class BatchOperation
        {
            public bool IsNewBatch { get; set; }       
            public int? ExistingBatchId { get; set; }  
            public decimal Amount { get; set; }    
            public decimal? UnitPrice { get; set; }
        }
    }
}
