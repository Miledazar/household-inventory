namespace InventoryApi.Models.Dtos
{
    public class CreateCategoryDto
    {
        public string cat_Name { get; set; } = string.Empty;
        public string? cat_Description { get; set; }
    }

    public class UpdateCategoryDto
    {
        public string cat_Name { get; set; } = string.Empty;
        public string? cat_Description { get; set; }
    }
}
