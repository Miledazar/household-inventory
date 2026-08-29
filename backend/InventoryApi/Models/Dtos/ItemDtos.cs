using System.ComponentModel.DataAnnotations;

public abstract class ItemDtoBase
{
    [Required(ErrorMessage = "Item name is required.")]
    [MinLength(3, ErrorMessage = "Item name must be at least 3 characters.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category is required.")]
    public int CategoryId { get; set; }

    public int? BrandId { get; set; }

    public decimal Threshold { get; set; }

    [Required(ErrorMessage = "Unit of measure is required.")]
    public int UnitOfMeasureId { get; set; }

    public bool Flag { get; set; }

    public string? Notes { get; set; }
}

public class CreateItemDto : ItemDtoBase { }

public class UpdateItemDto : ItemDtoBase
{
    public bool IsActive { get; set; } = true;
}