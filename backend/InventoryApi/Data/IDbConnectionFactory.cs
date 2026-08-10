using System.Data;

namespace InventoryApi.Data
{
    public interface IDbConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}
