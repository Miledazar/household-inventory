using Dapper;
using InventoryApi.Data;
using InventoryApi.Interfaces;
using InventoryApi.Models;

namespace InventoryApi.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public UserRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<User?> GetByNameAsync(string name)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM Users WHERE Us_Name = @Us_Name";
            return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Us_Name = name });
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM Users WHERE Id = @Id";
            return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
        }

        public async Task<int> CreateAsync(User user)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                INSERT INTO Users (Us_Name, PasswordHash)
                OUTPUT INSERTED.Id
                VALUES (@Name, @PasswordHash)";
            return await connection.QuerySingleAsync<int>(sql, user);
        }
    }
}