using InventoryApi.Models;
using System.Data;

namespace InventoryApi.Interfaces
{
    public interface IInventoryBatchRepository
    {
        Task<IEnumerable<InventoryBatch>> GetAllAsync(int userId);
        Task<IEnumerable<InventoryBatch>> GetByItemIdAsync(int itemId, int userId);
        Task<InventoryBatch?> GetByIdAsync(int id, int userId);
        Task<int> CreateAsync(InventoryBatch batch, IDbConnection connection, IDbTransaction dbTransaction);
        Task ReduceRemainingAsync(int batchId, decimal amount, IDbConnection connection, IDbTransaction dbTransaction);
        Task<IEnumerable<InventoryBatch>> GetOldestWithStockAsync(int itemId, IDbConnection connection, IDbTransaction dbTransaction);
    }
}
