using InventoryApi.Models.Dtos;

namespace InventoryApi.Interfaces
{
    public interface IDashboardRepository
    {
        Task<DashboardSummaryDto> GetSummaryAsync(int userId);
        Task<IEnumerable<LowStockItemDto>> GetLowStockAsync(int userId);
        Task<IEnumerable<ExpiringBatchDto>> GetExpiringSoonAsync(int userId, int daysAhead);
        Task<IEnumerable<CategorySpendingDto>> GetSpendingByCategoryAsync(int userId);
        Task<IEnumerable<ExpiringBatchDto>> GetExpiredNotWastedAsync(int userId);
    }
}