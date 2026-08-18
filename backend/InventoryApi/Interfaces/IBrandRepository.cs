using InventoryApi.Models;

namespace InventoryApi.Interfaces
{
    public interface IBrandRepository
    {
        Task<IEnumerable<Brand>> GetAllAsync(int userId);
        Task<Brand?> GetByIdAsync(int id, int userId);
        Task<int> CreateAsync(Brand brand);
        Task<bool> UpdateAsync(Brand brand);
        Task<bool> DeleteAsync(int id, int userId);
        Task<bool> HasReferencesAsync(int brandId, int userId);
    }
}
