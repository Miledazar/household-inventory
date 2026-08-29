using InventoryApi.Interfaces;
using InventoryApi.Models.Dtos;
using InventoryApi.Models;

namespace InventoryApi.Services
{
    public class ItemService
    {
        public readonly IItemRepository _itemRepository;

        public ItemService(IItemRepository itemRepository)
        {
            _itemRepository = itemRepository;
        }

        public async Task<int> CreateAsync(int userId, CreateItemDto dto)
        {
            if (dto.Threshold < 0)
                throw new ArgumentException("Threshold cannot be negative.");

            var normalizedName = dto.Name.Trim().ToLower();

            bool exists = await _itemRepository.ExistsAsync(userId, normalizedName, dto.BrandId);

            if (exists)
            {
                throw new InvalidOperationException("An item with this name and brand already exists.");
            }

            var item = new Item
            {
                UserId = userId,
                It_Name = dto.Name,
                Category_Id = dto.CategoryId,
                Brand_Id = dto.BrandId,
                Threshold = dto.Threshold,
                UnitOfMeasure_Id = dto.UnitOfMeasureId,
                Flag = dto.Flag,
                Notes = dto.Notes
            };

            return await _itemRepository.CreateAsync(item);
        }

        public async Task<bool> UpdateAsync(int userId, int id, UpdateItemDto dto)
        {
            if (dto.Threshold < 0)
                throw new ArgumentException("Threshold cannot be negative.");

            var existingItem = await _itemRepository.GetByIdAsync(id, userId);
            if (existingItem == null)
            {
                throw new KeyNotFoundException("Item not found.");
            }

            var newNormalizedName = dto.Name.Trim().ToLower();
            var currentNormalizedName = existingItem.It_Name.Trim().ToLower();

            bool nameChanged = newNormalizedName != currentNormalizedName;
            bool brandChanged = dto.BrandId != existingItem.Brand_Id;

            if (nameChanged || brandChanged)
            {
                bool exists = await _itemRepository.ExistsAsync(userId, newNormalizedName, dto.BrandId);

                if (exists)
                {
                    throw new InvalidOperationException("An item with this name and brand already exists.");
                }
            }

            var item = new Item
            {
                Id = id,
                UserId = userId,
                It_Name = dto.Name,
                Category_Id = dto.CategoryId,
                Brand_Id = dto.BrandId,
                Threshold = dto.Threshold,
                UnitOfMeasure_Id = dto.UnitOfMeasureId,
                Flag = dto.Flag,
                Notes = dto.Notes,
                IsActive = dto.IsActive,
            };

            return await _itemRepository.UpdateAsync(item);
        }

        public async Task<bool> DeleteAsync(int userId, int id)
        {
            var item = await _itemRepository.GetByIdAsync(id, userId);
            if (item == null)
                return false; // not found or belongs to someone else

            var hasHistory = await _itemRepository.HasTransactionHistoryAsync(id);
            if (hasHistory)
                throw new ArgumentException("This item has purchase/consumption history and cannot be deleted. Archive it instead.");

            return await _itemRepository.DeleteAsync(id, userId);
        }

        public async Task<bool> SetArchivedAsync(int userId, int id, bool isArchived)
        {
            return await _itemRepository.SetArchivedAsync(id, userId, isArchived);
        }

    }
}
