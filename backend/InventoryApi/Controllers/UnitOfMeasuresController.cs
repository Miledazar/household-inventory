using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InventoryApi.Interfaces;
using InventoryApi.Models;
using InventoryApi.Models.Dtos;
using InventoryApi.Services;

namespace InventoryApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UnitOfMeasuresController : ApiControllerBase
    {
        private readonly IUnitOfMeasureRepository _repository;
        private readonly UnitOfMeasureService _service;

        public UnitOfMeasuresController(IUnitOfMeasureRepository repository, UnitOfMeasureService service)
        {
            _repository = repository;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var units = await _repository.GetAllAsync(CurrentUserId);
            return Ok(units);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var unit = await _repository.GetByIdAsync(id, CurrentUserId);
            if (unit == null) return NotFound();
            return Ok(unit);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateUnitOfMeasureDto dto)
        {
            try
            {
                var id = await _service.CreateAsync(userId: CurrentUserId, dto);
                return Ok(new { id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateUnitOfMeasureDto dto)
        {
            try
            {
                var success = await _service.UpdateAsync(userId: CurrentUserId, id, dto);
                if (!success) return NotFound();
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _service.DeleteAsync(CurrentUserId, id);
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