using InventoryApi.Models;

namespace InventoryApi.Interfaces
{
    public interface IUnitOfMeasureRepository
    {
        Task<IEnumerable<UnitOfMeasure>> GetAllAsync(int userId);
        Task<UnitOfMeasure?> GetByIdAsync(int id, int userId);
        Task<int> CreateAsync(UnitOfMeasure unit);
        Task<bool> UpdateAsync(UnitOfMeasure unit);
        Task<bool> DeleteAsync(int id, int userId);
        Task<bool> HasReferencesAsync(int unitId, int userId);
        Task<bool> ExistsAsync(int userId, string normalizedUomName);
    }
}