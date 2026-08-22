using InventoryApi.Interfaces;
using InventoryApi.Models;
using InventoryApi.Models.Dtos;

namespace InventoryApi.Services
{
    public class BrandService
    {
        public readonly IBrandRepository _repository;

        public BrandService(IBrandRepository repository)
        {
            _repository = repository;
        }

        public async Task<int> CreateAsync(int userId, CreateBrandDto dto)
        {
            var brand = new Brand
            {
                UserId = userId,
                Br_Name = dto.br_Name
            };
            return await _repository.CreateAsync(brand);
        }

        public async Task<bool> UpdateAsync(int userId, int id, UpdateBrandDto dto)
        {
            var brand = new Brand
            {
                Id = id,
                UserId = userId,
                Br_Name = dto.br_Name
            };
            return await _repository.UpdateAsync(brand);
        }

        public async Task<bool> DeleteAsync(int userId, int id)
        {
            var brand = await _repository.GetByIdAsync(id, userId);
            if (brand == null) return false;

            var hasReferences = await _repository.HasReferencesAsync(id, userId);
            if (hasReferences)
                throw new ArgumentException("Cannot delete a brand that is still assigned to items.");

            return await _repository.DeleteAsync(id, userId);
        }
    }
}
