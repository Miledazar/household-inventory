using InventoryApi.Models;

namespace InventoryApi.Interfaces
{
    public interface IStoreRepository
    {
        Task<IEnumerable<Store>> GetAllAsync(int userId);
        Task<Store?> GetByIdAsync(int id, int userId);
        Task<int> CreateAsync(Store store);
        Task<bool> UpdateAsync(Store store);
        Task<bool> DeleteAsync(int id, int userId);
        Task<bool> HasReferencesAsync(int storeId, int userId);
    }
}
