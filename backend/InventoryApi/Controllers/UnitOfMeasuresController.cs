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
            var unit = new UnitOfMeasure
            {
                UserId = CurrentUserId,
                Name = dto.Name,
                AllowsDecimal = dto.AllowsDecimal
            };
            var id = await _repository.CreateAsync(unit);
            return Ok(new { id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateUnitOfMeasureDto dto)
        {
            var unit = new UnitOfMeasure
            {
                Id = id,
                UserId = CurrentUserId,
                Name = dto.Name,
                AllowsDecimal = dto.AllowsDecimal
            };
            var success = await _repository.UpdateAsync(unit);
            if (!success) return NotFound();
            return NoContent();
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