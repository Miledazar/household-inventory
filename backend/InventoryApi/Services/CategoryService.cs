using InventoryApi.Interfaces;
using InventoryApi.Models;
using InventoryApi.Models.Dtos;

namespace InventoryApi.Services
{
    public class CategoryService
    {
        private readonly ICategoryRepository _repository;

        public CategoryService(ICategoryRepository repository)
        {
            _repository = repository;
        }


        public async Task<int> CreateAsync(int userId, CreateCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.cat_Name))
            {
                throw new ArgumentException("Category name cannot be empty.");
            }

            var normalizedName = dto.cat_Name.Trim().ToLower();

            bool exists = await _repository.ExistsAsync(userId, normalizedName);

            if (exists)
            {
                throw new InvalidOperationException("A category with this name already exists.");
            }

            var category = new Category
            {
                UserId = userId,
                Cat_Name = dto.cat_Name,
                Cat_Description = dto.cat_Description
            };
            return await _repository.CreateAsync(category);
        }

        public async Task<bool> UpdateAsync(int userId, int id, UpdateCategoryDto dto)
        {
            var category = new Category
            {
                Id = id,
                UserId = userId,
                Cat_Name = dto.cat_Name,
                Cat_Description = dto.cat_Description
            };
            return await _repository.UpdateAsync(category);
        }
        public async Task<bool> DeleteAsync(int userId, int id)
        {
            var category = await _repository.GetByIdAsync(id, userId);
            if (category == null) return false;

            var hasReferences = await _repository.HasReferencesAsync(id, userId);
            if (hasReferences)
                throw new ArgumentException("Connot delete a category that still has items assigned to it.");

            return await _repository.DeleteAsync(id, userId);
        }
    }
}
