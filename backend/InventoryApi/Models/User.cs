namespace InventoryApi.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Us_Name { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
    }
}
