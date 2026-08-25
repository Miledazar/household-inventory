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
            if (string.IsNullOrWhiteSpace(dto.br_Name))
            {
                throw new ArgumentException("Category name cannot be empty.");
            }

            var normalizedName = dto.br_Name.Trim().ToLower();

            bool exists = await _repository.ExistsAsync(userId, normalizedName);

            if (exists)
            {
                throw new InvalidOperationException("A category with this name already exists.");
            }

            var brand = new Brand
            {
                UserId = userId,
                Br_Name = dto.br_Name
            };
            return await _repository.CreateAsync(brand);
        }

        public async Task<bool> UpdateAsync(int userId, int id, UpdateBrandDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.br_Name))
            {
                throw new ArgumentException("Brands name cannot be empty.");
            }

            var existingBrand = await _repository.GetByIdAsync(id, userId);
            if (existingBrand == null)
            {
                throw new KeyNotFoundException("Brand not found.");
            }

            var newNormalizedName = dto.br_Name.Trim().ToLower();
            var currentNormalizedName = existingBrand.Br_Name.Trim().ToLower();

            if (newNormalizedName != currentNormalizedName)
            {
                bool exists = await _repository.ExistsAsync(userId, newNormalizedName);

                if (exists)
                {
                    throw new InvalidOperationException("A brand with this name already exists.");
                }
            }

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
