using InventoryApi.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InventoryApi.Controllers
{
    public class ApiControllerBase : ControllerBase
    {
        protected int CurrentUserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}
