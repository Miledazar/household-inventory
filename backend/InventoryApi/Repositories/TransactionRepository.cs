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
        private readonly IInventoryBatchRepository _batchRepository;

        public TransactionRepository(IDbConnectionFactory connectionFactory, IInventoryBatchRepository batchRepository)
        {
            _connectionFactory = connectionFactory;
            _batchRepository = batchRepository;
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

        public async Task<int> CreateWithLinesAsync(int userId, CreateTransactionDto dto, List<LinePlan> plans)
        {
            using var connection = _connectionFactory.CreateConnection();
            connection.Open();
            using var dbTransaction = connection.BeginTransaction();
            try
            {
                var transactionId = await connection.QuerySingleAsync<int>(@"
                    INSERT INTO Transactions (UserId, Type, Date, Notes, StoreId, GroceryListId)
                    OUTPUT INSERTED.Id
                    VALUES (@UserId, @Type, @Date, @Notes, @StoreId, @GroceryListId)",
                    new { UserId = userId, dto.Type, dto.Date, dto.Notes, dto.StoreId, dto.GroceryListId}, dbTransaction);

                foreach (var plan in plans)
                {
                    var line = plan.Line;

                    var lineId = await connection.QuerySingleAsync<int>(@"
                        INSERT INTO TransactionLines (TransactionId, ItemId, BatchId, Quantity, UnitPrice)
                        OUTPUT INSERTED.Id
                        VALUES (@TransactionId, @ItemId, @BatchId, @Quantity, @UnitPrice)",
                        new { TransactionId = transactionId, line.ItemId, line.BatchId, line.Quantity, line.UnitPrice }, dbTransaction);

                    foreach (var op in plan.BatchOperations)
                    {
                        if (op.IsNewBatch)
                        {
                            var newBatch = new InventoryBatch
                            {
                                ItemId = line.ItemId,
                                TransactionLineId = lineId,
                                PurchasedQuantity = op.Amount,
                                RemainingQuantity = op.Amount,
                                UnitPrice = op.UnitPrice,
                                PurchaseDate = dto.Date,
                                ExpirationDate = line.ExpirationDate
                            };
                            await _batchRepository.CreateAsync(newBatch, connection, dbTransaction);
                        }
                        else
                        {
                            await _batchRepository.ReduceRemainingAsync(op.ExistingBatchId!.Value, op.Amount, connection, dbTransaction);
                        }
                    }

                    await connection.ExecuteAsync(@"
                        UPDATE Items 
                        SET CurrentQuantity = (SELECT ISNULL(SUM(RemainingQuantity), 0) FROM InventoryBatches WHERE ItemId = @ItemId)
                        WHERE Id = @ItemId AND UserId = @UserId",
                        new { ItemId = line.ItemId, UserId = userId }, dbTransaction);
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