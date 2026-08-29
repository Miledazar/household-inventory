namespace InventoryApi.Models
{
    public class UnitOfMeasure
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool AllowsDecimal { get; set; }
    }
}