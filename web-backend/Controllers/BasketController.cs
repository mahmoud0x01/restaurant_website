using Mahmoud_Restaurant.Models;
using Mahmoud_Restaurant.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using NSwag.Annotations;
using Microsoft.AspNetCore.Http;
namespace Mahmoud_Restaurant.Controllers
{
    [Route("api/basket")]
    [ApiController]
    [Authorize]
    public class BasketController : ControllerBase
    {
        private readonly OrderService _basketService;
        private readonly AuthService _authService;

        public BasketController(OrderService OrderService, AuthService authService)
        {
            _basketService = OrderService; //because both on same service as they both better be same service
            _authService = authService;
        }

        // GET /api/basket
        [HttpGet]
        [OpenApiOperation(
            operationId: "Basket",
            summary: "Get basket items for authenticated user",
            description: "this endpoint allows to Get basket items for authenticated user."
        )]
        public async Task<IActionResult> GetUserCart()
        {
            var userEmail = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized("Invalid token.");
            }

            // Fetch user details from the database
            var user = await _authService.Authorize(userEmail);
            var userId = user.Id;

            var cart = await _basketService.GetUserBasketAsync(userId);
            return Ok(cart);
        }

        // POST /api/basket/dish/{dishId}
        [HttpPost("dish/{dishId}")]
        [OpenApiOperation(
            operationId: "Basket",
            summary: "add dish to basket by dish id",
            description: "this endpoint allows to add dish to basket by dish id."
        )]
        public async Task<IActionResult> AddDishToCart(Guid dishId, [FromQuery] int quantity = 1)
        {
            var userEmail = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized("Invalid token.");
            }

            // Fetch user details from the database
            var user = await _authService.Authorize(userEmail);
            var userId = user.Id;

            try
            {
                await _basketService.AddDishToBasketAsync(userId, dishId, quantity);
                return Ok("Dish added to cart successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE /api/basket/dish/{dishId}
        [HttpDelete("dish/{dishId}")]
        [OpenApiOperation(
            operationId: "Basket",
            summary: "delete or decrement dish from basket by dish id",
            description: "this endpoint allows to delete or decrement dish from basket by dish id."
        )]
        public async Task<IActionResult> RemoveDishFromCart(Guid dishId, [FromQuery] bool increase = false, [FromQuery] int quantity = 1)
        {
            var userEmail = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized("Invalid token.");
            }

            // Fetch user details from the database
            var user = await _authService.Authorize(userEmail);
            var userId = user.Id;

            try
            {
                await _basketService.RemoveDishFromBasketAsync(userId, dishId, quantity,increase);
                return Ok("Dish updated in cart successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
