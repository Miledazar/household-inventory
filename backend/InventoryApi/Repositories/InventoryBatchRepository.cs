using System.Data;
using Dapper;
using InventoryApi.Data;
using InventoryApi.Interfaces;
using InventoryApi.Models;

namespace InventoryApi.Repositories
{
    public class InventoryBatchRepository: IInventoryBatchRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public InventoryBatchRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<InventoryBatch>> GetByItemIdAsync(int itemId, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"SELECT * FROM InventoryBatches 
                                JOIN Items ON Items.Id = InventoryBatches.ItemId
                                WHERE InventoryBatches.ItemId = @ItemId AND Items.UserId = @UserId AND InventoryBatches.RemainingQuantity > 0
                                ORDER BY InventoryBatches.PurchaseDate ASC";
            return await connection.QueryAsync<InventoryBatch>(sql, new { ItemId = itemId, UserId = userId });
        }

        public async Task<InventoryBatch?> GetByIdAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT * FROM InventoryBatches 
                JOIN Items ON Items.Id = InventoryBatches.ItemId
                WHERE InventoryBatches.Id = @Id AND Items.UserId = @UserId";
            return await connection.QuerySingleOrDefaultAsync<InventoryBatch>(sql, new { Id = id, UserId = userId });
        }

        //Used inside a Transaction so the connection comes from it and they are an atomic operation
        public async Task<int> CreateAsync(InventoryBatch batch, IDbConnection connection, IDbTransaction dbTransaction)
        {
            const string sql = @"
                INSERT INTO InventoryBatches (ItemId, TransactionLineId, PurchasedQuantity, RemainingQuantity, UnitPrice, PurchaseDate, ExpirationDate)
                OUTPUT INSERTED.Id
                VALUES (@ItemId, @TransactionLineId, @PurchasedQuantity, @RemainingQuantity, @UnitPrice, @PurchaseDate, @ExpirationDate)";
            return await connection.QuerySingleAsync<int>(sql, batch, dbTransaction);
        }

        //Same here
        public async Task ReduceRemainingAsync(int batchId, decimal amount, IDbConnection connection, IDbTransaction dbTransaction)
        {
            const string sql = "UPDATE InventoryBatches SET RemainingQuantity = RemainingQuantity - @Amount WHERE Id = @BatchId";
            await connection.ExecuteAsync(sql, new { Amount = amount, BatchId = batchId }, dbTransaction);
        }


        //Same here // used order by for FIFO ordering which is default behavior for decreasing 
        public async Task<IEnumerable<InventoryBatch>> GetOldestWithStockAsync(int itemId, IDbConnection connection, IDbTransaction dbTransaction)
        {
            const string sql = @"
                SELECT * FROM InventoryBatches 
                WHERE ItemId = @ItemId AND RemainingQuantity > 0 
                ORDER BY PurchaseDate ASC";
            return await connection.QueryAsync<InventoryBatch>(sql, new { ItemId = itemId }, dbTransaction);
        }
    }
}
