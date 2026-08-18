using InventoryApi.Interfaces;
using InventoryApi.Models;
using InventoryApi.Models.Dtos;
using static InventoryApi.Models.Dtos.TransactionDtos;

namespace InventoryApi.Services
{
    public class TransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IInventoryBatchRepository _batchRepository;
        private readonly GroceryListService _groceryListService;
        private static readonly string[] ValidTypes = { "Purchase", "Consumption", "Adjustment", "Wasted" };

        public TransactionService(ITransactionRepository transactionRepository, IInventoryBatchRepository batchRepository, GroceryListService groceryListService)
        {
            _transactionRepository = transactionRepository;
            _batchRepository = batchRepository;
            _groceryListService = groceryListService;
        }

        public async Task<int> CreateTransactionAsync(int userId, CreateTransactionDto dto)
        {
            if (!ValidTypes.Contains(dto.Type))
                throw new ArgumentException($"Invalid transaction type: {dto.Type}");

            if (dto.Lines.Count == 0)
                throw new ArgumentException("A transaction must have at least one line.");

            if (dto.Type is "Consumption" or "Wasted")
            {
                var duplicates = dto.Lines
                    .Where(l => l.BatchId == null)
                    .GroupBy(l => l.ItemId)
                    .Any(g => g.Count() > 1);

                if (duplicates)
                    throw new ArgumentException("Combine FIFO consumption lines for the same item into one line.");
            }

            var plans = new List<LinePlan>();

            foreach (var line in dto.Lines)
            {
                if (line.Quantity == 0)
                    throw new ArgumentException("Quantity cannot be zero.");

                if (dto.Type is "Purchase" or "Consumption" or "Wasted" && line.Quantity < 0)
                    throw new ArgumentException($"Quantity must be positive for {dto.Type} transactions.");

                var plan = new LinePlan { Line = line };
                bool createsNewBatch = dto.Type == "Purchase" || (dto.Type == "Adjustment" && line.Quantity > 0);

                if (createsNewBatch)
                {
                    plan.BatchOperations.Add(new BatchOperation
                    {
                        IsNewBatch = true,
                        Amount = Math.Abs(line.Quantity),
                        UnitPrice = line.UnitPrice ?? 0 
                    });
                }
                else
                {
                    var requiredAmount = Math.Abs(line.Quantity);

                    if (line.BatchId.HasValue)
                    {
                        var batch = await _batchRepository.GetByIdAsync(line.BatchId.Value, userId)
                            ?? throw new ArgumentException($"Batch {line.BatchId} not found.");

                        if (batch.RemainingQuantity < requiredAmount)
                            throw new ArgumentException($"Batch {line.BatchId} only has {batch.RemainingQuantity} remaining, requested {requiredAmount}.");

                        plan.BatchOperations.Add(new BatchOperation
                        {
                            IsNewBatch = false,
                            ExistingBatchId = line.BatchId,
                            Amount = requiredAmount
                        });
                    }
                    else
                    {
                        var oldestBatches = await _batchRepository.GetByItemIdAsync(line.ItemId, userId);

                        foreach (var batch in oldestBatches)
                        {
                            if (requiredAmount <= 0) break;
                            var takeFromThisBatch = Math.Min(batch.RemainingQuantity, requiredAmount);
                            plan.BatchOperations.Add(new BatchOperation
                            {
                                IsNewBatch = false,
                                ExistingBatchId = batch.Id,
                                Amount = takeFromThisBatch
                            });
                            requiredAmount -= takeFromThisBatch;
                        }

                        if (requiredAmount > 0)
                            throw new ArgumentException($"Not enough stock for item {line.ItemId} — short by {requiredAmount}.");
                    }
                }

                plans.Add(plan);
            }

            var transactionId = await _transactionRepository.CreateWithLinesAsync(userId, dto, plans);

            if (dto.GroceryListId.HasValue)
            {
                await _groceryListService.CleanupAfterPurchaseAsync(userId, dto.GroceryListId.Value);
            }

            return transactionId;
        }
    }
}