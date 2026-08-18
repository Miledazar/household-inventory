using InventoryApi.Interfaces;
using InventoryApi.Models.Dtos;
using static InventoryApi.Models.Dtos.GroceryListDtos;
using static InventoryApi.Models.Dtos.TransactionDtos;

namespace InventoryApi.Services
{
    public class GroceryListService
    {
        private readonly IGroceryListRepository _groceryListRepository;
        private readonly IItemRepository _itemRepository;
   

        public GroceryListService(IGroceryListRepository groceryListRepository, IItemRepository itemRepository)
        {
            _groceryListRepository = groceryListRepository;
            _itemRepository = itemRepository;
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
            var lowStockItems = (await _itemRepository.GetLowStockAsync(userId)).ToList();

            if (lowStockItems.Count == 0)
                throw new ArgumentException("No items are currently below their threshold — nothing to generate.");

            var listId = await _groceryListRepository.CreateEmptyAsync(userId, $"Auto-generated - {DateTime.UtcNow:MMM d}");

            foreach (var item in lowStockItems)
            {
                var lastPrice = await _itemRepository.GetLastPriceAsync(item.Id, userId);
                await _groceryListRepository.AddItemAsync(listId, userId, item.Id, item.Threshold, lastPrice);
            }

            return listId;
        }

        public async Task<int> AddItemAsync(int userId, int groceryListId, AddGroceryListItemDto dto)
        {
            if (dto.QuantityNeeded <= 0)
                throw new ArgumentException("Quantity needed must be greater than zero.");

            if (dto.EstimatedPrice < 0)
                throw new ArgumentException("Estimated price cannot be negative.");

            var priceToUse = dto.EstimatedPrice ?? await _itemRepository.GetLastPriceAsync(dto.ItemId, userId);
            return await _groceryListRepository.AddItemAsync(groceryListId, userId, dto.ItemId, dto.QuantityNeeded, priceToUse);
        }

        public async Task<bool> UpdateItemAsync(int userId, int groceryListItemId, UpdateGroceryListItemDto dto)
        {
            if (dto.QuantityNeeded <= 0)
                throw new ArgumentException("Quantity needed must be greater than zero.");

            if (dto.EstimatedPrice < 0)
                throw new ArgumentException("Estimated price cannot be negative.");

            return await _groceryListRepository.UpdateItemAsync(groceryListItemId, userId, dto.QuantityNeeded, dto.EstimatedPrice);
        }

        public async Task<bool> RemoveItemAsync(int userId, int groceryListItemId)
        {
            return await _groceryListRepository.RemoveItemAsync(groceryListItemId, userId);
        }

        public async Task<bool> SetCheckedAsync(int userId, int groceryListItemId, bool isChecked)
        {
            return await _groceryListRepository.SetCheckedAsync(groceryListItemId, userId, isChecked);
        }

        public async Task<CreateTransactionDto> PrepareTransactionFromListAsync(int userId, int groceryListId, int? storeId)
        {
            var list = await _groceryListRepository.GetByIdAsync(groceryListId, userId) ?? throw new ArgumentException("Grocery list not found");

            var checkedItems = (await _groceryListRepository.GetCheckedItemsAsync(groceryListId, userId)).ToList();
            if (checkedItems.Count == 0)
            {
                throw new ArgumentException("No items checked — nothing to purchase.");
            }
            if (checkedItems.Any(i => i.EstimatedPrice == null))
            {
                throw new ArgumentException("All checked items must have a price before creating a transaction.");
            }

            var transactionDto = new CreateTransactionDto
            {
                Type = "Purchase",
                Date = DateTime.UtcNow,
                Notes = $"From grocery list: {list.Gr_Name}",
                StoreId = storeId,
                GroceryListId = groceryListId,
                Lines = checkedItems.Select(i => new CreateTransactionLineDto
                {
                    ItemId = i.ItemId,
                    Quantity = i.QuantityNeeded,
                    UnitPrice = i.EstimatedPrice
                }).ToList()
            };

            return transactionDto;
        }

        public async Task CleanupAfterPurchaseAsync(int userId, int groceryListId)
        {
            var checkedItems = (await _groceryListRepository.GetCheckedItemsAsync(groceryListId, userId)).ToList();

            foreach (var item in checkedItems)
            {
                var removed = await _groceryListRepository.RemoveItemAsync(item.Id, userId);
                if (!removed)
                    throw new InvalidOperationException($"Failed to remove grocery list item {item.Id} after purchase — data may be inconsistent.");
            }

            var remainingItems = await _groceryListRepository.GetItemsAsync(groceryListId, userId);
            if (!remainingItems.Any())
            {
                await _groceryListRepository.SetStatusAsync(groceryListId, userId, "Completed");
            }
        }

        //public async Task<int> FinishShoppingAsync(int userId, int groceryListId, int? storeId)
        //{
        //    var list = await _groceryListRepository.GetByIdAsync(groceryListId, userId) ?? throw new ArgumentException("Grocery list not found");

        //    var checkedItems = (await _groceryListRepository.GetCheckedItemsAsync(groceryListId, userId)).ToList();
        //    if(checkedItems.Count == 0)
        //    {
        //        throw new ArgumentException("No items checked — nothing to purchase.");
        //    }
        //    if(checkedItems.Any(i => i.EstimatedPrice == null))
        //    {
        //        throw new ArgumentException("All checked items must have a price before finishing shopping.");
        //    }

        //    var transactionDto = new CreateTransactionDto
        //    {
        //        Type = "Purchase",
        //        Date = DateTime.UtcNow,
        //        Notes = $"From grocery list: {list.Gr_Name}",
        //        StoreId = storeId,
        //        GroceryListId = groceryListId,
        //        Lines = checkedItems.Select(i => new CreateTransactionLineDto
        //        {
        //            ItemId = i.ItemId,
        //            Quantity = i.QuantityNeeded,
        //            UnitPrice = i.EstimatedPrice
        //        }).ToList()
        //    };

        //    var transactionId = await _transactionService.CreateTransactionAsync(userId, transactionDto);

        //    foreach (var item in checkedItems)
        //    {
        //        var removed = await _groceryListRepository.RemoveItemAsync(item.Id, userId);
        //        if (!removed)
        //            throw new InvalidOperationException($"Failed to remove grocery list item {item.Id} after purchase — data may be inconsistent.");
        //    }

        //    var remainingItems = await _groceryListRepository.GetItemsAsync(groceryListId, userId);
        //    if (!remainingItems.Any())
        //    {
        //        await _groceryListRepository.SetStatusAsync(groceryListId, userId, "Completed");
        //    }

        //    return transactionId;
        //}

        public async Task<bool> CloseListAsync(int userId, int groceryListId)
        {
            return await _groceryListRepository.SetStatusAsync(groceryListId, userId, "Completed");
        }

        public async Task<bool> DeleteAsync(int userId, int groceryListId)
        {
            var list = await _groceryListRepository.GetByIdAsync(groceryListId, userId);
            if (list == null) return false;// not found or belongs to someone else

            var hasHistory = await _groceryListRepository.HasLinkedTransactionsAsync(groceryListId);
            if (hasHistory)
                throw new ArgumentException("This list has completed purchases linked to it and cannot be deleted. Close it instead.");

            return await _groceryListRepository.DeleteAsync(groceryListId, userId);
        }
    }
}