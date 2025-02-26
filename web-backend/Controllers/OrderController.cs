using Mahmoud_Restaurant.Models;
using Mahmoud_Restaurant.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using NSwag.Annotations;
using Microsoft.AspNetCore.Http;

namespace Mahmoud_Restaurant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly OrderService _orderService;
        private readonly AuthService _authService;

        public OrderController(OrderService orderService, AuthService authService)
        {
            _authService = authService;
            _orderService = orderService;
        }

        [HttpGet]
        [Authorize]
        [OpenApiOperation(
            operationId: "Order",
            summary: "Get order history for authenticated user",
            description: "this endpoint allows to Get order history for authenticated user"
        )]
        public async Task<IActionResult> GetUserOrders()
        {
            try
            {
                var userEmail = User.FindFirst(ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized("Invalid token.");
                }

                // Fetch user details from the database
                var user = await _authService.Authorize(userEmail);
                var userId = user.Id;

                var orders = await _orderService.GetOrdersAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        [OpenApiOperation(
            operationId: "Order",
            summary: "Get order details by order id for authenticated user",
            description: "this endpoint allows to Get order details by order id"
        )]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            try
            {
                var userEmail = User.FindFirst(ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized("Invalid token.");
                }

                // Fetch user details from the database
                var user = await _authService.Authorize(userEmail);
                var userId = user.Id;

                var order = await _orderService.GetOrderByIdAsync(id, userId);
                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize]
        [OpenApiOperation(
            operationId: "Order",
            summary: "create new order from available cart or basket for authenticated user",
            description: "this endpoint allows to create new order from available cart or basket for authenticated user"
        )]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            // Check if the delivery time is at least 60 minutes in the future
            if (request.DeliveryTime <= DateTime.UtcNow.AddMinutes(60))
            {
                return BadRequest("Delivery time must be at least 60 minutes in the future.");
            }
            try
            {
                var userEmail = User.FindFirst(ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized("Invalid token.");
                }

                // Fetch user details from the database
                var user = await _authService.Authorize(userEmail);
                var userId = user.Id;

                // Create the order, passing the basket data to the service
                var order = await _orderService.CreateOrderAsync(userId, request.DeliveryTime, request.Address);

                // Return the created order along with its URL
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/status")]
        [Authorize]
        [OpenApiOperation(
            operationId: "Order",
            summary: "confirm order delivery by order id for authenticated user",
            description: "this endpoint allows to confirm order delivery by order id for authenticated user"
        )]
        public async Task<IActionResult> ConfirmOrderDelivery(Guid id)
        {
            try
            {
                var userEmail = User.FindFirst(ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized("Invalid token.");
                }

                // Fetch user details from the database
                var user = await _authService.Authorize(userEmail);
                var userId = user.Id;

                await _orderService.ConfirmOrderDeliveryAsync(id, userId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class CreateOrderRequest
    {
        public DateTime DeliveryTime { get; set; }
        public string Address { get; set; }
        // No need for Basket data here since it is now handled within the service logic
    }
}
