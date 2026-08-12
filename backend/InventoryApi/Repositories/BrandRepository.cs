using Dapper;
using InventoryApi.Data;
using InventoryApi.Interfaces;
using InventoryApi.Models;

namespace InventoryApi.Repositories
{
    public class BrandRepository: IBrandRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public BrandRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Brand>> GetAllAsync(int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM Brands WHERE UserId = @UserId";
            return await connection.QueryAsync<Brand>(sql, new {UserId = userId});
        }

        public async Task<Brand?> GetByIdAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM Brands WHERE Id = @Id AND UserId = @UserId";
            return await connection.QuerySingleOrDefaultAsync<Brand>(sql, new { Id = id, UserId = userId });
        }

        public async Task<int> CreateAsync(Brand brand)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                INSERT INTO Brands (UserId, Br_Name)
                OUTPUT INSERTED.Id
                VALUES (@UserId, @Br_Name)";
            return await connection.QuerySingleAsync<int>(sql, brand);
        }

        public async Task<bool> UpdateAsync(Brand brand)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "UPDATE Brands SET Br_Name = @Br_Name WHERE Id = @Id AND UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, brand);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "DELETE FROM Brands WHERE Id = @Id AND UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });
            return rows > 0;
        }
    }
}
