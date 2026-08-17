using InventoryApi.Models;

namespace InventoryApi.Interfaces
{
    public interface IItemRepository
    {
        Task<IEnumerable<Item>> GetAllAsync(int userId, string filter = "active");
        Task<Item?> GetByIdAsync(int id, int userId);
        Task<int> CreateAsync(Item item);
        Task<bool> UpdateAsync(Item item);
        Task<bool> DeleteAsync(int id, int userId);
        Task<bool> SetArchivedAsync(int id, int userId, bool isArchived);
        Task<IEnumerable<Item>> GetLowStockAsync(int userId);
        Task<decimal?> GetLastPriceAsync(int itemId, int userId);
        Task<bool> HasTransactionHistoryAsync(int itemId);
    }
}
