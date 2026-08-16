using Dapper;
using InventoryApi.Data;
using InventoryApi.Interfaces;
using InventoryApi.Models;

namespace InventoryApi.Repositories
{
    public class GroceryListRepository : IGroceryListRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public GroceryListRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<GroceryList>> GetAllAsync(int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM GroceryLists WHERE UserId = @UserId";
            return await connection.QueryAsync<GroceryList>(sql, new { UserId = userId });
        }

        public async Task<GroceryList?> GetByIdAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM GroceryLists WHERE Id = @Id AND UserId = @UserId";
            return await connection.QuerySingleOrDefaultAsync<GroceryList>(sql, new { Id = id, UserId = userId });
        }

        public async Task<IEnumerable<GroceryListItem>> GetItemsAsync(int groceryListId, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT * FROM GroceryListItems 
                JOIN GroceryLists  ON GroceryLists.Id = GroceryListItems.GroceryListId
                WHERE GroceryListItems.GroceryListId = @GroceryListId AND GroceryLists.UserId = @UserId";
            return await connection.QueryAsync<GroceryListItem>(sql, new { GroceryListId = groceryListId, UserId = userId });
        }

        public async Task<IEnumerable<GroceryListItem>> GetCheckedItemsAsync(int groceryListId, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT * FROM GroceryListItems
                JOIN GroceryLists  ON GroceryLists.Id = GroceryListItems.GroceryListId
                WHERE GroceryListItems.GroceryListId = @GroceryListId AND GroceryLists.UserId = @UserId AND GroceryListItems.IsChecked = 1";
            return await connection.QueryAsync<GroceryListItem>(sql, new { GroceryListId = groceryListId, UserId = userId });
        }

        public async Task<int> CreateEmptyAsync(int userId, string? name)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                INSERT INTO GroceryLists (UserId, Gr_Name, Status)
                OUTPUT INSERTED.Id
                VALUES (@UserId, @Name, 'Active')";
            return await connection.QuerySingleAsync<int>(sql, new { UserId = userId, Name = name });
        }

        public async Task<int> GenerateFromThresholdAsync(int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            connection.Open();
            using var dbTransaction = connection.BeginTransaction();
            try
            {
                var listId = await connection.QuerySingleAsync<int>(@"
                    INSERT INTO GroceryLists (UserId, Gr_Name, Status)
                    OUTPUT INSERTED.Id
                    VALUES (@UserId, 'Auto-generated', 'Active')",
                    new { UserId = userId }, dbTransaction);

                var lowStockItems = await connection.QueryAsync<Item>(@"
                    SELECT * FROM Items WHERE UserId = @UserId AND CurrentQuantity < Threshold",
                    new { UserId = userId }, dbTransaction);

                foreach (var item in lowStockItems)
                {
                    await connection.ExecuteAsync(@"
                        INSERT INTO GroceryListItems (GroceryListId, ItemId, QuantityNeeded, IsChecked)
                        VALUES (@GroceryListId, @ItemId, @QuantityNeeded, 0)",
                        new { GroceryListId = listId, ItemId = item.Id, QuantityNeeded = item.Threshold }, dbTransaction);
                }

                dbTransaction.Commit();
                return listId;
            }
            catch
            {
                dbTransaction.Rollback();
                throw;
            }
        }

        public async Task<int> AddItemAsync(int groceryListId, int userId, int itemId, decimal quantityNeeded)
        {
            using var connection = _connectionFactory.CreateConnection();
            var list = await connection.QuerySingleOrDefaultAsync<GroceryList>(
                "SELECT * FROM GroceryLists WHERE Id = @Id AND UserId = @UserId",
                new { Id = groceryListId, UserId = userId });
            if (list == null)
                throw new ArgumentException("Grocery list not found.");

            const string sql = @"
                INSERT INTO GroceryListItems (GroceryListId, ItemId, QuantityNeeded, IsChecked)
                OUTPUT INSERTED.Id
                VALUES (@GroceryListId, @ItemId, @QuantityNeeded, 0)";
            return await connection.QuerySingleAsync<int>(sql, new { GroceryListId = groceryListId, ItemId = itemId, QuantityNeeded = quantityNeeded });
        }

        public async Task<bool> RemoveItemAsync(int groceryListItemId, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                DELETE GroceryListItems FROM GroceryListItems 
                JOIN GroceryLists  ON GroceryLists.Id = GroceryListItems.GroceryListId
                WHERE GroceryListItems.Id = @Id AND GroceryLists.UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, new { Id = groceryListItemId, UserId = userId });
            return rows > 0;
        }

        public async Task<bool> SetCheckedAsync(int groceryListItemId, int userId, bool isChecked)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                UPDATE GroceryListItems SET GroceryListItems.IsChecked = @IsChecked
                FROM GroceryListItems
                JOIN GroceryLists ON GroceryLists.Id = GroceryListItems.GroceryListId
                WHERE GroceryListItems.Id = @Id AND GroceryLists.UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, new { Id = groceryListItemId, UserId = userId, IsChecked = isChecked });
            return rows > 0;
        }

        public async Task<bool> SetStatusAsync(int groceryListId, int userId, string status)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "UPDATE GroceryLists SET Status = @Status WHERE Id = @Id AND UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, new { Id = groceryListId, UserId = userId, Status = status });
            return rows > 0;
        }
    }
}