using Microsoft.AspNetCore.Mvc;
using InventoryApi.Interfaces;
using InventoryApi.Models;


namespace InventoryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BrandsController: ControllerBase
    {
        private readonly IBrandRepository _repository;

        public BrandsController(IBrandRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var brands = await _repository.GetAllAsync(userId: 1);
            return Ok(brands);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Brand brand)
        {
            brand.UserId = 1;
            var id = await _repository.CreateAsync(brand);
            return Ok(new { id });
        }
    }
}
