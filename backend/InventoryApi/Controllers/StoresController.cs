using InventoryApi.Interfaces;
using InventoryApi.Models;
using InventoryApi.Models.Dtos;
using InventoryApi.Repositories;
using InventoryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]

    public class StoresController: ApiControllerBase
    {
        private readonly IStoreRepository _repository;
        private readonly StoreService _service;

        public StoresController (IStoreRepository repository, StoreService service)
        {
            _repository = repository;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var stores = await _repository.GetAllAsync(userId: CurrentUserId);
            return Ok(stores);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var store = await _repository.GetByIdAsync(id, userId: CurrentUserId);
            if (store == null) return NotFound();
            return Ok(store);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateStoreDto dto)
        {
            var id = await _service.CreateAsync(userId: CurrentUserId, dto);
            return Ok(new { id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateStoreDto dto)
        {
            var success = await _service.UpdateAsync(userId: CurrentUserId, id, dto);
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
