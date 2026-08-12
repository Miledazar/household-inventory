using InventoryApi.Models;
using InventoryApi.Models.Dtos;
using static InventoryApi.Models.Dtos.TransactionDtos;

namespace InventoryApi.Interfaces
{
    public interface ITransactionRepository
    {
        Task<IEnumerable<Transaction>> GetAllAsync(int userId);
        Task<Transaction?> GetByIdAsync(int id, int userId);
        Task<IEnumerable<TransactionLine>> GetLinesAsync(int transactionId, int userId);
        Task<int> CreateWithLinesAsync(int userId, CreateTransactionDto dto);
    }
}
