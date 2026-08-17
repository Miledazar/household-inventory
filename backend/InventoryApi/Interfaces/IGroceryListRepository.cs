using InventoryApi.Models;

namespace InventoryApi.Interfaces
{
    public interface IGroceryListRepository
    {
        Task<IEnumerable<GroceryList>> GetAllAsync(int userId);
        Task<GroceryList?> GetByIdAsync(int id, int userId);
        Task<IEnumerable<GroceryListItem>> GetItemsAsync(int groceryListId, int userId);
        Task<IEnumerable<GroceryListItem>> GetCheckedItemsAsync(int groceryListId, int userId);
        Task<int> CreateEmptyAsync(int userId, string? name);
        Task<int> AddItemAsync(int groceryListId, int userId, int itemId, decimal quantityNeeded, decimal? estimatedPrice);
        Task<bool> RemoveItemAsync(int groceryListItemId, int userId);
        Task<bool> UpdateItemAsync(int groceryListItemId, int userId, decimal? quantityNeeded, decimal? estimatedPrice);
        Task<bool> SetCheckedAsync(int groceryListItemId, int userId, bool isChecked);
        Task<bool> SetStatusAsync(int groceryListId, int userId, string status);
        Task<bool> HasLinkedTransactionsAsync(int groceryListId);
        Task<bool> DeleteAsync(int groceryListId, int userId);

    }
}
