using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InventoryApi.Interfaces;

namespace InventoryApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ApiControllerBase
    {
        private readonly IDashboardRepository _repository;

        public DashboardController(IDashboardRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _repository.GetSummaryAsync(CurrentUserId);
            return Ok(summary);
        }

        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStock()
        {
            var items = await _repository.GetLowStockAsync(CurrentUserId);
            return Ok(items);
        }

        [HttpGet("expiring-soon")]
        public async Task<IActionResult> GetExpiringSoon([FromQuery] int daysAhead = 7)
        {
            var batches = await _repository.GetExpiringSoonAsync(CurrentUserId, daysAhead);
            return Ok(batches);
        }

        [HttpGet("spending-by-category")]
        public async Task<IActionResult> GetSpendingByCategory()
        {
            var spending = await _repository.GetSpendingByCategoryAsync(CurrentUserId);
            return Ok(spending);
        }

        [HttpGet("expired")]
        public async Task<IActionResult> GetExpired()
        {
            var batches = await _repository.GetExpiredNotWastedAsync(CurrentUserId);
            return Ok(batches);
        }
    }
}