using Dapper;
using InventoryApi.Data;
using InventoryApi.Interfaces;
using InventoryApi.Models;

namespace InventoryApi.Repositories
{
    public class ItemRepository: IItemRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public ItemRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Item>> GetAllAsync(int userId, string filter = "active")
        {
            using var connection = _connectionFactory.CreateConnection();
            var sql = "SELECT * FROM Items WHERE UserId = @UserId";
            sql += filter switch
            {
                "active" => " AND IsActive = 1",
                "archived" => " AND IsActive = 0",
                "all" => "",
                _ => " AND IsActive = 1"
            };
            return await connection.QueryAsync<Item>(sql, new { UserId = userId });
        }

        public async Task<Item?> GetByIdAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM Items WHERE Id = @Id AND UserId = @UserId";
            return await connection.QuerySingleOrDefaultAsync<Item>(sql, new { Id = id, UserId = userId });
        }

        public async Task<int> CreateAsync(Item item)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                INSERT INTO Items (UserId, It_Name, CategoryId, BrandId, Threshold, CurrentQuantity, Flag, Notes, UnitOfMeasure, IsActive)
                OUTPUT INSERTED.Id
                VALUES (@UserId, @It_Name, @CategoryId, @BrandId, @Threshold, @CurrentQuantity, @Flag, @Notes, @UnitOfMeasure, 1)";
            return await connection.QuerySingleAsync<int>(sql, item);
        }

        public async Task<bool> UpdateAsync(Item item)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                UPDATE Items
                SET It_Name = @It_Name, CategoryId = @CategoryId, BrandId = @BrandId,
                    Threshold = @Threshold, Flag = @Flag, Notes = @Notes, UnitOfMeasure = @UnitOfMeasure
                WHERE Id = @Id AND UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, item);
            return rows > 0;
        }

        
        public async Task<bool> HasTransactionHistoryAsync(int itemId)
        {
            using var connection = _connectionFactory.CreateConnection();
            var count = await connection.QuerySingleAsync<int>(
                "SELECT COUNT(*) FROM TransactionLines WHERE ItemId = @ItemId", new { ItemId = itemId });
            return count > 0;
        }
        public async Task<bool> DeleteAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "DELETE FROM Items WHERE Id = @Id AND UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });
            return rows > 0;
        }
        public async Task<bool> SetArchivedAsync(int id, int userId, bool isArchived)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "UPDATE Items SET IsActive = @IsActive WHERE Id = @Id AND UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId, IsActive = !isArchived });
            return rows > 0;
        }

        public async Task<IEnumerable<Item>> GetLowStockAsync(int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM Items WHERE UserId = @UserId AND CurrentQuantity < Threshold";
            return await connection.QueryAsync<Item>(sql, new { UserId = userId });
        }

        public async Task<decimal?> GetLastPriceAsync(int itemId, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"SELECT TOP 1 UnitPrice 
                                 FROM TransactionLines
                                 JOIN Transactions ON Transactions.Id = TransactionLines.TransactionId
                                 WHERE TransactionLines.ItemId = @ItemId AND Transactions.UserId = @UserId AND Transactions.Type = 'Purchase'
                                 ORDER BY Transactions.Date DESC";
            return await connection.QuerySingleOrDefaultAsync<decimal?>(sql, new { ItemId = itemId, UserId = userId });
        }
    }
}
