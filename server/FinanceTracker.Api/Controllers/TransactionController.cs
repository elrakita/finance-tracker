using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.DTOs;
using FinanceTracker.Api.Interfaces;
using System.Security.Claims;

namespace FinanceTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<TransactionResponse>>> PostTransaction([FromBody] CreateTransactionRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _transactionService.CreateTransactionAsync(request, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("account/{accountId}")]
        public async Task<ActionResult<ApiPaginatedResponse<TransactionResponse>>> GetAccountTransactions(
            string accountId, 
            [FromQuery] int page = 0, 
            [FromQuery] int limit = 20)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                var result = await _transactionService.GetAccountTransactionsAsync(accountId, userId, page, limit);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string> { Success = false, Message = ex.Message });
            }
        }
    }

}
