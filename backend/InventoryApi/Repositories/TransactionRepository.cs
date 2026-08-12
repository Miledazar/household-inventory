using Dapper;
using InventoryApi.Data;
using InventoryApi.Interfaces;
using InventoryApi.Models;
using InventoryApi.Models.Dtos;
using static InventoryApi.Models.Dtos.TransactionDtos;

namespace InventoryApi.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public TransactionRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Transaction>> GetAllAsync(int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM Transactions WHERE UserId = @UserId";
            return await connection.QueryAsync<Transaction>(sql, new { UserId = userId });
        }

        public async Task<Transaction?> GetByIdAsync(int id, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT * FROM Transactions WHERE Id = @Id AND UserId = @UserId";
            return await connection.QuerySingleOrDefaultAsync<Transaction>(sql, new { Id = id, UserId = userId });
        }

        public async Task<IEnumerable<TransactionLine>> GetLinesAsync(int transactionId, int userId)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"SELECT * FROM TransactionLines
                                JOIN Transactions ON Transactions.Id = TransactionLines.TransactionId
                                WHERE TransactionLines.TransactionId = @TransactionId AND Transactions.UserId = @UserId";
            return await connection.QueryAsync<TransactionLine>(sql, new { TransactionId = transactionId, UserId = userId });
        }

        public async Task<int> CreateWithLinesAsync(int userId, CreateTransactionDto dto)
        {
            using var connection = _connectionFactory.CreateConnection();
            connection.Open();
            using var dbTransaction = connection.BeginTransaction();
            try
            {
                var transactionId = await connection.QuerySingleAsync<int>(@"
                                    INSERT INTO Transactions (UserId, Type, Date, Notes, StoreId)
                                    OUTPUT INSERTED.Id
                                    VALUES (@UserId, @Type, @Date, @Notes, @StoreId)", new { UserId = userId, dto.Type, dto.Date, dto.Notes, dto.StoreId }, dbTransaction);

                foreach (var line in dto.Lines)
                {
                    await connection.ExecuteAsync(@"
                    INSERT INTO TransactionLines (TransactionId, ItemId, Quantity, UnitPrice)
                    VALUES (@TransactionId, @ItemId, @Quantity, @UnitPrice)",
                    new { TransactionId = transactionId, line.ItemId, line.Quantity, line.UnitPrice }, dbTransaction);

                    await connection.ExecuteAsync(@"
                    UPDATE Items SET CurrentQuantity = CurrentQuantity + @Quantity
                    WHERE Id = @ItemId AND UserId = @UserId",
                    new { line.Quantity, line.ItemId, UserId = userId }, dbTransaction);
                }

                dbTransaction.Commit();
                return transactionId;
            }
            catch
            {
                dbTransaction.Rollback();
                throw;
            }
        }
    }
}