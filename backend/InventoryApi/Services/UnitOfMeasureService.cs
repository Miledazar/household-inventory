using InventoryApi.Interfaces;

namespace InventoryApi.Services
{
    public class UnitOfMeasureService
    {
        private readonly IUnitOfMeasureRepository _repository;

        public UnitOfMeasureService(IUnitOfMeasureRepository repository)
        {
            _repository = repository;
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