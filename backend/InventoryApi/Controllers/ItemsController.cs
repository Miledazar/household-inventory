using InventoryApi.Interfaces;
using InventoryApi.Models;
using InventoryApi.Models.Dtos;
using InventoryApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController : ControllerBase
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
            var items = await _repository.GetAllAsync(userId: 1, filter);
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _repository.GetByIdAsync(id, userId: 1);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStock()
        {
            var items = await _repository.GetLowStockAsync(userId: 1);
            return Ok(items);
        }

        [HttpGet("{id}/last-price")]
        public async Task<IActionResult> GetLastPrice(int id)
        {
            var price = await _repository.GetLastPriceAsync(id, userId: 1);
            return Ok(new { price });
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateItemDto dto)
        {
            try
            {
                var id = await _itemService.CreateAsync(userId: 1, dto);
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
                var success = await _itemService.UpdateAsync(userId: 1, id, dto);
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
                var success = await _itemService.DeleteAsync(userId: 1, id);
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
            var success = await _itemService.SetArchivedAsync(userId: 1, id, isArchived);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpGet("{id}/batches")]
        public async Task<IActionResult> GetBatches(int id)
        {
            var batches = await _batchRepository.GetByItemIdAsync(id, userId: 1);
            return Ok(batches);
        }
    }
}