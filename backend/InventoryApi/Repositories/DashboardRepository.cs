using Dapper;
using InventoryApi.Data;
using InventoryApi.Interfaces;
using InventoryApi.Models.Dtos;

namespace InventoryApi.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public DashboardRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync(int userId)
        {
            using var connection = _connectionFactory.CreateConnection();

            const string totalSpentSql = @"
                SELECT ISNULL(SUM(tl.Quantity * tl.UnitPrice), 0)
                FROM TransactionLines tl
                JOIN Transactions t ON t.Id = tl.TransactionId
                WHERE t.UserId = @UserId AND t.Type = 'Purchase'";

            const string stockValueSql = @"
                SELECT ISNULL(SUM(ib.RemainingQuantity * ISNULL(ib.UnitPrice, 0)), 0)
                FROM InventoryBatches ib
                JOIN Items i ON i.Id = ib.ItemId
                WHERE i.UserId = @UserId AND ib.RemainingQuantity > 0";

            const string wasteValueSql = @"
                SELECT ISNULL(SUM(tl.Quantity * ISNULL(ib.UnitPrice, 0)), 0)
                FROM TransactionLines tl
                JOIN Transactions t ON t.Id = tl.TransactionId
                LEFT JOIN InventoryBatches ib ON ib.Id = tl.BatchId
                WHERE t.UserId = @UserId AND t.Type = 'Wasted'";

            var totalSpent = await connection.QuerySingleAsync<decimal>(totalSpentSql, new { UserId = userId });
            var stockValue = await connection.QuerySingleAsync<decimal>(stockValueSql, new { UserId = userId });
            var wasteValue = await connection.QuerySingleAsync<decimal>(wasteValueSql, new { UserId = userId });

            return new DashboardSummaryDto
            {
                TotalSpent = totalSpent,
                CurrentStockValue = stockValue,
                WasteValue = wasteValue
            };
        }

        public async Task<IEnumerable<LowStockItemDto>> GetLowStockAsync(int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT Items.Id AS ItemId, It_Name [name], CurrentQuantity, Threshold, u.name [UnitOfMeasure], Br_Name as [BrandName]
                FROM Items Left join Brands on Brands.id = items.brandid
                inner join UnitOfMeasures u on u.id = UnitOfMeasureId
                WHERE Items.UserId = @UserId AND IsActive = 1 AND CurrentQuantity < Threshold
                ORDER BY (Threshold - CurrentQuantity) DESC";
            return await connection.QueryAsync<LowStockItemDto>(sql, new { UserId = userId });
        }

        public async Task<IEnumerable<ExpiringBatchDto>> GetExpiringSoonAsync(int userId, int daysAhead)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT ib.Id AS BatchId, ib.ItemId, i.It_Name AS ItemName, ib.RemainingQuantity,u.name [UnitOfMeasure], ib.ExpirationDate,Br_Name [BrandName]
                FROM InventoryBatches ib
                JOIN Items i ON i.Id = ib.ItemId
                inner join UnitOfMeasures u on u.id = UnitOfMeasureId
                LEFT JOIN Brands b on b.id = i.BrandId
                WHERE i.UserId = @UserId 
                  AND ib.RemainingQuantity > 0
                  AND ib.ExpirationDate IS NOT NULL
                  AND ib.ExpirationDate BETWEEN GETUTCDATE() AND DATEADD(day, @DaysAhead, GETUTCDATE())
                ORDER BY ib.ExpirationDate ASC";
            return await connection.QueryAsync<ExpiringBatchDto>(sql, new { UserId = userId, DaysAhead = daysAhead });
        }

        public async Task<IEnumerable<CategorySpendingDto>> GetSpendingByCategoryAsync(int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT c.Cat_Name AS CategoryName, SUM(tl.Quantity * tl.UnitPrice) AS TotalSpent
                FROM TransactionLines tl
                JOIN Transactions t ON t.Id = tl.TransactionId
                JOIN Items i ON i.Id = tl.ItemId
                JOIN Categories c ON c.Id = i.CategoryId
                WHERE t.UserId = @UserId AND t.Type = 'Purchase'
                GROUP BY c.Cat_Name
                ORDER BY TotalSpent DESC";
            return await connection.QueryAsync<CategorySpendingDto>(sql, new { UserId = userId });
        }

        public async Task<IEnumerable<ExpiringBatchDto>> GetExpiredNotWastedAsync(int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                SELECT ib.Id AS BatchId, ib.ItemId, i.It_Name AS ItemName, ib.RemainingQuantity, ib.ExpirationDate, Br_Name [BrandName]
                FROM InventoryBatches ib
                JOIN Items i ON i.Id = ib.ItemId
                LEFT JOIN Brands b on b.id = i.BrandId
                WHERE i.UserId = @UserId
                  AND ib.RemainingQuantity > 0
                  AND ib.ExpirationDate IS NOT NULL
                  AND ib.ExpirationDate < GETUTCDATE()
                ORDER BY ib.ExpirationDate ASC";
            return await connection.QueryAsync<ExpiringBatchDto>(sql, new { UserId = userId });
        }
    }
}