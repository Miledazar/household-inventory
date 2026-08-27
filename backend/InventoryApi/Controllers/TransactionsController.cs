using InventoryApi.Interfaces;
using InventoryApi.Models.Dtos;
using InventoryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static InventoryApi.Models.Dtos.TransactionDtos;

namespace InventoryApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ApiControllerBase
    {
        private readonly ITransactionRepository _repository;
        private readonly TransactionService _transactionService;

        public TransactionsController(ITransactionRepository repository, TransactionService transactionService)
        {
            _repository = repository;
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var transactions = await _repository.GetAllAsync(userId: CurrentUserId);
            return Ok(transactions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var transaction = await _repository.GetByIdAsync(id, userId: CurrentUserId);
            if (transaction == null) return NotFound();
            return Ok(transaction);
        }

        [HttpGet("{id}/lines")]
        public async Task<IActionResult> GetLines(int id)
        {
            var lines = await _repository.GetLinesAsync(id, userId: CurrentUserId);
            return Ok(lines);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTransactionDto dto)
        {
            try
            {
                var id = await _transactionService.CreateTransactionAsync(userId: CurrentUserId, dto);
                return Ok(new { id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number == 2601 || ex.Number == 2627)
            {
                return BadRequest("This item and batch combination has already been added to this transaction. Please combine the quantities into a single line instead.");
            }
        }
    }
}