using InventoryApi.Interfaces;
using InventoryApi.Models.Dtos;
using Microsoft.AspNetCore.Mvc;
using static InventoryApi.Models.Dtos.TransactionDtos;

namespace InventoryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionRepository _repository;

        public TransactionsController(ITransactionRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var transactions = await _repository.GetAllAsync(userId: 1);
            return Ok(transactions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var transaction = await _repository.GetByIdAsync(id, userId: 1);
            if (transaction == null) return NotFound();
            return Ok(transaction);
        }

        [HttpGet("{id}/lines")]
        public async Task<IActionResult> GetLines(int id)
        {
            var lines = await _repository.GetLinesAsync(id, userId: 1);
            return Ok(lines);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTransactionDto dto)
        {
            var id = await _repository.CreateWithLinesAsync(userId: 1, dto);
            return Ok(new { id });
        }
    }
}