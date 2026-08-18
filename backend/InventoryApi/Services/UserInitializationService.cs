using InventoryApi.Interfaces;
using InventoryApi.Models;

namespace InventoryApi.Services
{
    public class UserInitializationService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IBrandRepository _brandRepository;

        private static readonly (string Name, string? Description)[] DefaultCategories =
        {
            ("Cleaning", "Cleaning supplies and detergents"),
            ("Beverages", "Drinks: water, juice, coffee"),
            ("Pantry", "Dry goods, canned food"),
            ("Hygiene", "Personal care items"),
            ("Produce", "Fresh fruits and vegetables"),
            ("Dairy", "Milk, cheese, yogurt"),
            ("Frozen", "Frozen foods"),
            ("Household", "General household items")
        };

        private static readonly string[] DefaultBrands =
        {
            // Local & Regional Lebanese Brands
            "Plein Soleil",
            "Gandour",
            "Master",
            "Al-Wadi Al-Akhdar",
            "Taanayel Les Fermes",
            "Cortas",
            "Cafe Najjar",
            "Ameed Coffee",
            "Chtaura Food Products",
            "Kazkaz",
            "Malrak",
            "Najm",
            "Liban Lait",
            "Bonjus",
            "Kassatly Chtaura",
            "Al Rifai",

            // International & Widely Used Brands in Lebanon
            "Nestle",
            "Knorr",
            "Hellmann's",
            "Lipton",
            "Barilla",
            "Nutella",
            "Milka",
            "Cadbury",
            "Indomie",
            "Heinz",
            "Maggi",
            "Nido",
            "Goody"
        };
        public UserInitializationService(ICategoryRepository categoryRepository, IBrandRepository brandRepository)
        {
            _categoryRepository = categoryRepository;
            _brandRepository = brandRepository;
        }

        public async Task SeedDefaultAsync(int userId)
        {
            foreach (var (name, description) in DefaultCategories)
            {
                await _categoryRepository.CreateAsync(new Category
                {
                    UserId = userId,
                    Cat_Name = name,
                    Cat_Description = description
                });
            }

            foreach (var name in DefaultBrands)
            {
                await _brandRepository.CreateAsync(new Brand
                {
                    UserId = userId,
                    Br_Name = name
                });
            }
        }
    }
}
