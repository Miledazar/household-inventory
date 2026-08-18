using InventoryApi.Interfaces;
using InventoryApi.Models;
using InventoryApi.Models.Dtos;
using InventoryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController : ApiControllerBase
    {
        private readonly IItemRepository _repository;
        private readonly IInventoryBatchRepository _batchRepository;
        public readonly ItemService _itemService;
        

        public ItemsController(IItemRepository repository, IInventoryBatchRepository batchRepository, ItemService itemService)
        {
            _repository = repository;
            _batchRepository = batchRepository;
            _itemService = itemService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string filter = "active")
        {
            var items = await _repository.GetAllAsync(userId: CurrentUserId, filter);
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _repository.GetByIdAsync(id, userId: CurrentUserId);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStock()
        {
            var items = await _repository.GetLowStockAsync(userId: CurrentUserId);
            return Ok(items);
        }

        [HttpGet("{id}/last-price")]
        public async Task<IActionResult> GetLastPrice(int id)
        {
            var price = await _repository.GetLastPriceAsync(id, userId: CurrentUserId);
            return Ok(new { price });
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateItemDto dto)
        {
            try
            {
                var id = await _itemService.CreateAsync(userId: CurrentUserId, dto);
                return Ok(new { id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateItemDto dto)
        {
            try
            {
                var success = await _itemService.UpdateAsync(userId: CurrentUserId, id, dto);
                if (!success) return NotFound();
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _itemService.DeleteAsync(userId: CurrentUserId, id);
                if (!success) return NotFound();
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{id}/archive")]
        public async Task<IActionResult> SetArchived(int id, [FromBody] bool isArchived)
        {
            var success = await _itemService.SetArchivedAsync(userId: CurrentUserId, id, isArchived);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpGet("{id}/batches")]
        public async Task<IActionResult> GetBatches(int id)
        {
            var batches = await _batchRepository.GetByItemIdAsync(id, userId: CurrentUserId);
            return Ok(batches);
        }
    }
}