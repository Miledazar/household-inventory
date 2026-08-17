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

            var item = new Item
            {
                UserId = userId,
                It_Name = dto.Name,
                CategoryId = dto.CategoryId,
                BrandId = dto.BrandId,
                Threshold = dto.Threshold,
                UnitOfMeasure = dto.UnitOfMeasure,
                Flag = dto.Flag,
                Notes = dto.Notes
            };

            return await _itemRepository.CreateAsync(item);
        }

        public async Task<bool> UpdateAsync(int userId, int id, UpdateItemDto dto)
        {
            if (dto.Threshold < 0)
                throw new ArgumentException("Threshold cannot be negative.");

            var item = new Item
            {
                Id = id,
                UserId = userId,
                It_Name = dto.Name,
                CategoryId = dto.CategoryId,
                BrandId = dto.BrandId,
                Threshold = dto.Threshold,
                UnitOfMeasure = dto.UnitOfMeasure,
                Flag = dto.Flag,
                Notes = dto.Notes
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
