using Microsoft.AspNetCore.Mvc;
using InventoryApi.Interfaces;
using InventoryApi.Models;
using InventoryApi.Repositories;

namespace InventoryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class StoresController: ControllerBase
    {
        private readonly IStoreRepository _repository;

        public StoresController (IStoreRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var stores = await _repository.GetAllAsync(userId: 1);
            return Ok(stores);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Store store)
        {
            store.UserId = 1;
            var id = await _repository.CreateAsync(store);
            return Ok(new { id });
        }
    }
}
