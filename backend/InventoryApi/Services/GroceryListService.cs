using InventoryApi.Interfaces;
using InventoryApi.Models.Dtos;
using static InventoryApi.Models.Dtos.GroceryListDtos;
using static InventoryApi.Models.Dtos.TransactionDtos;

namespace InventoryApi.Services
{
    public class GroceryListService
    {
        private readonly IGroceryListRepository _groceryListRepository;
        private readonly TransactionService _transactionService;

        public GroceryListService(IGroceryListRepository groceryListRepository, TransactionService transactionService)
        {
            _groceryListRepository = groceryListRepository;
            _transactionService = transactionService;
        }

        public async Task<int> CreateEmptyAsync(int userId, CreateGroceryListDto dto)
        {
            var name = string.IsNullOrWhiteSpace(dto.Name)
                ? $"Grocery List - {DateTime.UtcNow:MMM d}"
                : dto.Name;
            return await _groceryListRepository.CreateEmptyAsync(userId, name);
        }

        public async Task<int> GenerateFromThresholdAsync(int userId)
        {
            return await _groceryListRepository.GenerateFromThresholdAsync(userId);
        }

        public async Task<int> AddItemAsync(int userId, int groceryListId, AddGroceryListItemDto dto)
        {
            if (dto.QuantityNeeded <= 0)
                throw new ArgumentException("Quantity needed must be greater than zero.");
            return await _groceryListRepository.AddItemAsync(groceryListId, userId, dto.ItemId, dto.QuantityNeeded);
        }

        public async Task<bool> RemoveItemAsync(int userId, int groceryListItemId)
        {
            return await _groceryListRepository.RemoveItemAsync(groceryListItemId, userId);
        }

        public async Task<bool> SetCheckedAsync(int userId, int groceryListItemId, bool isChecked)
        {
            return await _groceryListRepository.SetCheckedAsync(groceryListItemId, userId, isChecked);
        }

        public async Task<int> FinishShoppingAsync(int userId, int groceryListId)
        {
            var list = await _groceryListRepository.GetByIdAsync(groceryListId, userId)
                ?? throw new ArgumentException("Grocery list not found.");

            var checkedItems = (await _groceryListRepository.GetCheckedItemsAsync(groceryListId, userId)).ToList();
            if (checkedItems.Count == 0)
                throw new ArgumentException("No items checked — nothing to purchase.");

            var transactionDto = new CreateTransactionDto
            {
                Type = "Purchase",
                Date = DateTime.UtcNow,
                Notes = $"From grocery list: {list.Gr_Name}",
                StoreId = null,
                Lines = checkedItems.Select(i => new CreateTransactionLineDto
                {
                    ItemId = i.ItemId,
                    Quantity = i.QuantityNeeded,
                    UnitPrice = null
                }).ToList()
            };

            return await _transactionService.CreateTransactionAsync(userId, transactionDto);
        }

        public async Task<bool> CloseListAsync(int userId, int groceryListId)
        {
            return await _groceryListRepository.SetStatusAsync(groceryListId, userId, "Completed");
        }
    }
}