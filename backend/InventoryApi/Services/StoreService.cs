using InventoryApi.Interfaces;
using InventoryApi.Models;
using InventoryApi.Models.Dtos;

namespace InventoryApi.Services
{
    public class StoreService
    {
        private readonly IStoreRepository _repository;

        public StoreService(IStoreRepository repository)
        {
            _repository = repository;
        }

        public async Task<int> CreateAsync(int userId, CreateStoreDto dto)
        {
            var store = new Store
            {
                UserId = userId,
                St_Name = dto.Name
            };
            return await _repository.CreateAsync(store);
        }

        public async Task<bool> UpdateAsync(int userId, int id, UpdateStoreDto dto)
        {
            var store = new Store
            {
                Id = id,
                UserId = userId,
                St_Name = dto.Name
            };
            return await _repository.UpdateAsync(store);
        }

        public async Task<bool> DeleteAsync(int userId, int id)
        {
            var store = await _repository.GetByIdAsync(id, userId);
            if (store == null) return false;

            var hasReferences = await _repository.HasReferencesAsync(id, userId);
            if (hasReferences)
                throw new ArgumentException("Cannot delete a store that has transactions linked to it.");

            return await _repository.DeleteAsync(id, userId);
        }
    }
}