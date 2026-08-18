using InventoryApi.Interfaces;
using InventoryApi.Models.Dtos;
using InventoryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static InventoryApi.Models.Dtos.GroceryListDtos;

namespace InventoryApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GroceryListsController : ApiControllerBase
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
            var lists = await _repository.GetAllAsync(userId: CurrentUserId);
            return Ok(lists);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var list = await _repository.GetByIdAsync(id, userId: CurrentUserId);
            if (list == null) return NotFound();
            return Ok(list);
        }

        [HttpGet("{id}/items")]
        public async Task<IActionResult> GetItems(int id)
        {
            var items = await _repository.GetItemsAsync(id, userId: CurrentUserId);
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> CreateEmpty(CreateGroceryListDto dto)
        {
            var id = await _service.CreateEmptyAsync(userId: CurrentUserId, dto);
            return Ok(new { id });
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateFromThreshold()
        {
            try
            {
                var id = await _service.GenerateFromThresholdAsync(userId: CurrentUserId);
                return Ok(new { id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id}/items")]
        public async Task<IActionResult> AddItem(int id, AddGroceryListItemDto dto)
        {
            try
            {
                var itemId = await _service.AddItemAsync(userId: CurrentUserId, id, dto);
                return Ok(new { id = itemId });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("items/{groceryListItemId}")]
        public async Task<IActionResult> UpdateItem(int groceryListItemId, UpdateGroceryListItemDto dto)
        {
            try
            {
                var success = await _service.UpdateItemAsync(userId: CurrentUserId, groceryListItemId, dto);
                if (!success) return NotFound();
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("items/{groceryListItemId}")]
        public async Task<IActionResult> RemoveItem(int groceryListItemId)
        {
            var success = await _service.RemoveItemAsync(userId: CurrentUserId, groceryListItemId);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPatch("items/{groceryListItemId}/check")]
        public async Task<IActionResult> SetChecked(int groceryListItemId, [FromBody] bool isChecked)
        {
            var success = await _service.SetCheckedAsync(userId: CurrentUserId, groceryListItemId, isChecked);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPost("{id}/prepare-transaction")]
        public async Task<IActionResult> PrepareTransaction(int id, [FromQuery] int? storeId)
        {
            try
            {
                var dto = await _service.PrepareTransactionFromListAsync(userId: CurrentUserId, id, storeId);
                return Ok(dto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id}/close")]
        public async Task<IActionResult> CloseList(int id)
        {
            var success = await _service.CloseListAsync(userId: CurrentUserId, id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _service.DeleteAsync(userId: CurrentUserId, id);
                if (!success) return NotFound();
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}