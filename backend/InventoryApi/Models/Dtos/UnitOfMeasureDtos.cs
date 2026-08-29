namespace InventoryApi.Models.Dtos
{
    public class CreateUnitOfMeasureDto
    {
        public string Name { get; set; } = string.Empty;
        public bool AllowsDecimal { get; set; }
    }

    public class UpdateUnitOfMeasureDto
    {
        public string Name { get; set; } = string.Empty;
        public bool AllowsDecimal { get; set; }
    }
}