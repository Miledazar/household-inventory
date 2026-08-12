using InventoryApi.Models;

namespace InventoryApi.Interfaces
{
    public interface IItemRepository
    {
        Task<IEnumerable<Item>> GetAllAsync(int userId);
        Task<Item?> GetByIdAsync(int id, int userId);
        Task<int> CreateAsync(Item item);
        Task<bool> UpdateAsync(Item item);
        Task<bool> DeleteAsync(int id, int userId);
        Task<IEnumerable<Item>> GetLowStockAsync(int userId);
    }
}
