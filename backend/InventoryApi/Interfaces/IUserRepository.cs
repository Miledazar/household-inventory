using InventoryApi.Models;

namespace InventoryApi.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByNameAsync(string name);
        Task<User?> GetByIdAsync(int id);
        Task<int> CreateAsync(User user);
    }
}
