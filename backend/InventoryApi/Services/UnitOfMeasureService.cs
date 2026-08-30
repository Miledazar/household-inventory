using InventoryApi.Interfaces;
using InventoryApi.Models;
using InventoryApi.Models.Dtos;

namespace InventoryApi.Services
{
    public class UnitOfMeasureService
    {
        private readonly IUnitOfMeasureRepository _repository;

        public UnitOfMeasureService(IUnitOfMeasureRepository repository)
        {
            _repository = repository;
        }


        public async Task<int> CreateAsync(int userId, CreateUnitOfMeasureDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("Unit of measure name cannot be empty.");
            }

            var normalizedName = dto.Name.Trim().ToLower();

            bool exists = await _repository.ExistsAsync(userId, normalizedName);

            if (exists)
            {
                throw new InvalidOperationException("A unit of measure with this name already exists.");
            }

            var unit = new UnitOfMeasure
            {
                UserId = userId,
                Name = dto.Name,
                AllowsDecimal = dto.AllowsDecimal
            };
            return await _repository.CreateAsync(unit);
        }

        public async Task<bool> UpdateAsync(int userId, int id, UpdateUnitOfMeasureDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("Unit of measure name cannot be empty.");
            }

            var existingUom = await _repository.GetByIdAsync(id, userId);
            if (existingUom == null)
            {
                throw new KeyNotFoundException("Unit of measure not found.");
            }

            var newNormalizedName = dto.Name.Trim().ToLower();
            var currentNormalizedName = existingUom.Name.Trim().ToLower();

            if (newNormalizedName != currentNormalizedName)
            {
                bool exists = await _repository.ExistsAsync(userId, newNormalizedName);

                if (exists)
                {
                    throw new InvalidOperationException("A unit of measure with this name already exists.");
                }
            }

            var unit = new UnitOfMeasure
            {
                Id = id,
                UserId = userId,
                Name = dto.Name,
                AllowsDecimal = dto.AllowsDecimal
            };

            return await _repository.UpdateAsync(unit);
        }

        public async Task<bool> DeleteAsync(int userId, int id)
        {
            var unit = await _repository.GetByIdAsync(id, userId);
            if (unit == null) return false;

            var hasReferences = await _repository.HasReferencesAsync(id, userId);
            if (hasReferences)
                throw new ArgumentException("Cannot delete a unit of measure that is still assigned to items.");

            return await _repository.DeleteAsync(id, userId);
        }
    }
}