using Dapper;
using InventoryApi.Data;
using InventoryApi.Interfaces;
using InventoryApi.Models;

namespace InventoryApi.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public CategoryRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Category>> GetAllAsync(int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM Categories WHERE UserId = @UserId";
            return await connection.QueryAsync<Category>(sql, new { UserId = userId });
        }

        public async Task<Category?> GetByIdAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM Categories WHERE Id = @Id and UserId = @UserId";
            return await connection.QuerySingleOrDefaultAsync<Category>(sql, new { Id = id, UserId = userId });
        }

        public async Task<int> CreateAsync(Category category)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                INSERT INTO Categories (UserId, Cat_Name, Cat_Description)
                OUTPUT INSERTED.Id
                VALUES (@UserId, @Cat_Name, @Cat_Description)";
            return await connection.QuerySingleAsync<int>(sql, category);
        }


        public async Task<bool> UpdateAsync(Category category)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"UPDATE Categories 
                SET Cat_Name = @Cat_Name, Cat_Description = @Cat_Description 
                WHERE Id = @Id AND UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, category);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "DELETE FROM Categories WHERE Id = @Id AND UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });
            return rows > 0;
        }

        public async Task<bool> HasReferencesAsync(int categoryId, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"SELECT COUNT(*) FROM Items WHERE CategoryId = @Id AND UserId= @UserId";
            var count = await connection.QuerySingleAsync<int>(sql, new { Id = categoryId, UserId = userId });
            return count > 0;
        }
    }
}
