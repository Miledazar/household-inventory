using Microsoft.AspNetCore.Mvc;
using InventoryApi.Interfaces;
using InventoryApi.Models;

namespace InventoryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController : ControllerBase
    {
        private readonly IItemRepository _repository;

        public ItemsController(IItemRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _repository.GetAllAsync(userId: 1);
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Item item)
        {
            item.UserId = 1;
            var id = await _repository.CreateAsync(item);
            return Ok(new { id });
        }
    }
}
