using InventoryApi.Interfaces;
using InventoryApi.Models.Dtos;
using InventoryApi.Services;
using Microsoft.AspNetCore.Mvc;
using static InventoryApi.Models.Dtos.GroceryListDtos;

namespace InventoryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroceryListsController : ControllerBase
    {
        private readonly IGroceryListRepository _repository;
        private readonly GroceryListService _service;

        public GroceryListsController(IGroceryListRepository repository, GroceryListService service)
        {
            _repository = repository;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var lists = await _repository.GetAllAsync(userId: 1);
            return Ok(lists);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var list = await _repository.GetByIdAsync(id, userId: 1);
            if (list == null) return NotFound();
            return Ok(list);
        }

        [HttpGet("{id}/items")]
        public async Task<IActionResult> GetItems(int id)
        {
            var items = await _repository.GetItemsAsync(id, userId: 1);
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> CreateEmpty(CreateGroceryListDto dto)
        {
            var id = await _service.CreateEmptyAsync(userId: 1, dto);
            return Ok(new { id });
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateFromThreshold()
        {
            var id = await _service.GenerateFromThresholdAsync(userId: 1);
            return Ok(new { id });
        }

        [HttpPost("{id}/items")]
        public async Task<IActionResult> AddItem(int id, AddGroceryListItemDto dto)
        {
            try
            {
                var itemId = await _service.AddItemAsync(userId: 1, id, dto);
                return Ok(new { id = itemId });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("items/{groceryListItemId}")]
        public async Task<IActionResult> RemoveItem(int groceryListItemId)
        {
            var success = await _service.RemoveItemAsync(userId: 1, groceryListItemId);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPatch("items/{groceryListItemId}/check")]
        public async Task<IActionResult> SetChecked(int groceryListItemId, [FromBody] bool isChecked)
        {
            var success = await _service.SetCheckedAsync(userId: 1, groceryListItemId, isChecked);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPost("{id}/finish-shopping")]
        public async Task<IActionResult> FinishShopping(int id, [FromQuery] int? storeId)
        {
            try
            {
                var transactionId = await _service.FinishShoppingAsync(userId: 1, id, storeId);
                return Ok(new { transactionId });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id}/close")]
        public async Task<IActionResult> CloseList(int id)
        {
            var success = await _service.CloseListAsync(userId: 1, id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}