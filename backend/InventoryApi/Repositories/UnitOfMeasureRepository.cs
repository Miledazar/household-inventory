using Dapper;
using InventoryApi.Data;
using InventoryApi.Interfaces;
using InventoryApi.Models;

namespace InventoryApi.Repositories
{
    public class UnitOfMeasureRepository : IUnitOfMeasureRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public UnitOfMeasureRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<UnitOfMeasure>> GetAllAsync(int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM UnitOfMeasures WHERE UserId = @UserId ORDER BY Name";
            return await connection.QueryAsync<UnitOfMeasure>(sql, new { UserId = userId });
        }

        public async Task<UnitOfMeasure?> GetByIdAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM UnitOfMeasures WHERE Id = @Id AND UserId = @UserId";
            return await connection.QuerySingleOrDefaultAsync<UnitOfMeasure>(sql, new { Id = id, UserId = userId });
        }

        public async Task<int> CreateAsync(UnitOfMeasure unit)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                INSERT INTO UnitOfMeasures (UserId, Name, AllowsDecimal)
                OUTPUT INSERTED.Id
                VALUES (@UserId, @Name, @AllowsDecimal)";
            return await connection.QuerySingleAsync<int>(sql, unit);
        }

        public async Task<bool> UpdateAsync(UnitOfMeasure unit)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                UPDATE UnitOfMeasures SET Name = @Name, AllowsDecimal = @AllowsDecimal
                WHERE Id = @Id AND UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, unit);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "DELETE FROM UnitOfMeasures WHERE Id = @Id AND UserId = @UserId";
            var rows = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });
            return rows > 0;
        }

        public async Task<bool> HasReferencesAsync(int unitId, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            // Items.UnitOfMeasure is currently a plain string column — see note below
            const string sql = @"
                SELECT COUNT(*) FROM Items i
                JOIN UnitOfMeasures u ON u.Name = i.UnitOfMeasure AND u.UserId = i.UserId
                WHERE u.Id = @UnitId AND i.UserId = @UserId";
            var count = await connection.QuerySingleAsync<int>(sql, new { UnitId = unitId, UserId = userId });
            return count > 0;
        }
    }
}