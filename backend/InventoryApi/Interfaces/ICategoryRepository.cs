using InventoryApi.Models;

namespace InventoryApi.Interfaces
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync(int userId);
        Task<Category?> GetByIdAsync(int id, int userId);
        Task<int> CreateAsync(Category category);
        Task<bool> UpdateAsync(Category category);
        Task<bool> DeleteAsync(int id, int userId);
        Task<bool> HasReferencesAsync(int categoryId, int userId);
        Task<bool> ExistsAsync(int userId, string normalizedCategoryName);
    }
}
