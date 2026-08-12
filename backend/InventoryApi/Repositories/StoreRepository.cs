using Dapper;
using InventoryApi.Data;
using InventoryApi.Interfaces;
using InventoryApi.Models;

namespace InventoryApi.Repositories
{
    public class StoreRepository: IStoreRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public StoreRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Store>> GetAllAsync(int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM Stores WHERE UserId = @UserId";
            return await connection.QueryAsync<Store>(sql, new { UserId = userId });
        }

        public async Task<Store?> GetByIdAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM Stores WHERE Id = @Id AND UserId = @UserId";
            return await connection.QuerySingleOrDefaultAsync<Store>(sql, new { Id = id, UserId = userId });
        }

        public async Task<int> CreateAsync(Store store)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                INSERT INTO Stores (UserId, St_Name)
                OUTPUT INSERTED.Id
                VALUES (@UserId, @St_Name)";
            return await connection.QuerySingleAsync<int>(sql, store);
        }

        public async Task<bool> UpdateAsync(Store store)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "UPDATE Stores SET St_Name = @St_Name WHERE Id = @Id AND UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, store);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "DELETE FROM Stores WHERE Id = @Id AND UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });
            return rows > 0;
        }

    }
}
