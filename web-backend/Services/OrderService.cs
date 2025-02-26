using Mahmoud_Restaurant.Data;
using Mahmoud_Restaurant.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mahmoud_Restaurant.Services
{
    public class OrderService
    {
        private readonly ApplicationDbContext _context;

        public OrderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<OrderDto> GetOrderByIdAsync(Guid id, int userId)
        {
            var order = await _context.Orders
                .Where(o => o.UserId == userId && o.Id == id)  // Check both UserId and Order Id
                .Include(o => o.Basket) // Include Basket which contains BasketDishes
                    .ThenInclude(b => b.BasketDishes) // Include BasketDishes in the Basket
                    .ThenInclude(bd => bd.Dish) // Include Dish details in the BasketDishes
                .FirstOrDefaultAsync();

            if (order == null)
            {
                throw new KeyNotFoundException("Order not found or you are not authorized to access it.");
            }

            // Map to OrderDto and convert Status to string
            var orderDto = new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                DeliveryTime = order.DeliveryTime,
                OrderTime = order.OrderTime,
                Status = order.Status.ToString(),  // Convert Status enum to string
                Price = order.Price,
                Address = order.Address
            };

            return orderDto;
        }

        public async Task<List<OrderDto>> GetOrdersAsync(int userId)
        {
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.Basket) // Include the Basket associated with the Order
                    .ThenInclude(b => b.BasketDishes) // Include BasketDishes in the Basket
                    .ThenInclude(bd => bd.Dish) // Include Dish in the BasketDishes
                .ToListAsync();

            // Map to OrderDto and convert Status to string
            var orderDtos = orders.Select(order => new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                DeliveryTime = order.DeliveryTime,
                OrderTime = order.OrderTime,
                Status = order.Status.ToString(), // Convert OrderStatus to string
                Price = order.Price,
                Address = order.Address
            }).ToList();

            return orderDtos;
        }


        // Create an order from the user's basket
        public async Task<Order> CreateOrderAsync(int userId, DateTime deliveryTime, string address)
        {
            // Fetch the user's basket (with BasketDishes and Dish details)
            var basket = await _context.Baskets
                .Include(b => b.BasketDishes)
                .ThenInclude(bd => bd.Dish)
                .FirstOrDefaultAsync(b => b.UserId == userId);

            if (basket == null || !basket.BasketDishes.Any())
            {
                throw new ArgumentException("Basket cannot be empty.");
            }

            // Calculate the total price dynamically
            var totalPrice = basket.BasketDishes.Sum(bd => bd.Price);

            // Create a new order based on the basket
            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                DeliveryTime = deliveryTime,
                OrderTime = DateTime.UtcNow,
                Status = OrderStatus.Pending,
                Address = address,
                Price = totalPrice,  // Use the calculated total price
                BasketId = basket.Id  // Link the order to the basket
            };

            // Add the order to the database
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Optionally, clear the basket after order creation
            _context.Baskets.Remove(basket);  // Or update status if needed
            await _context.SaveChangesAsync();

            return order;
        }



        // Confirm order delivery
        public async Task ConfirmOrderDeliveryAsync(Guid orderId, int userId)
        {
            // Fetch the order from the database by Id and UserId
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            // If order is not found or user is not authorized, throw an exception
            if (order == null)
            {
                throw new KeyNotFoundException("Order not found or you are not authorized to confirm delivery.");
            }

            // Check if the order is already delivered or confirmed, which is not allowed
            if (order.Status == OrderStatus.Delivered)
            {
                throw new InvalidOperationException("Order has already been delivered.");
            }

            // Only allow confirmation if the order is in "Pending" status
            if (order.Status != OrderStatus.Pending)
            {
                throw new InvalidOperationException("Order is not in a confirmable state.");
            }

            // Set the order status to "Delivered"
            order.Status = OrderStatus.Delivered;

            // Save changes to the database
            await _context.SaveChangesAsync();
        }

        public async Task<List<object>> GetUserBasketAsync(int userId)
        {
            var basket = await _context.Baskets
                .Include(b => b.BasketDishes)
                .ThenInclude(bd => bd.Dish)
                .FirstOrDefaultAsync(b => b.UserId == userId);

            if (basket == null)
            {
                // Optionally create a new basket if none exists for the user
                basket = new Basket
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    BasketDishes = new List<BasketDish>() // Empty list of BasketDishes
                };
                _context.Baskets.Add(basket);
                await _context.SaveChangesAsync();
            }

            // Transform the response to the exact required structure
            var response = basket.BasketDishes.Select(bd => new
            {
                name = bd.Dish.Name,
                price = bd.Dish.Price,
                totalPrice = bd.Dish.Price * bd.Quantity,
                amount = bd.Quantity,
                image = bd.Dish.Image,
                id = bd.DishId
            }).ToList<object>();

            return response;
        }


        // Add dish to basket
        public async Task AddDishToBasketAsync(int userId, Guid dishId, int quantity = 1)
        {
            // Re-fetch the basket from the database to ensure we're working with the latest version
            var basket = await _context.Baskets
                .Include(b => b.BasketDishes)
                .FirstOrDefaultAsync(b => b.UserId == userId);

            if (basket == null)
            {
                // If no basket exists, create a new one
                basket = new Basket
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    BasketDishes = new List<BasketDish>()
                };

                // Add the basket to the context and save it immediately to make sure it's created
                _context.Baskets.Add(basket);
                await _context.SaveChangesAsync();  // Save after adding the basket
            }

            // Fetch the dish to add to the basket
            var dish = await _context.Dishes.FindAsync(dishId);
            if (dish == null)
            {
                throw new KeyNotFoundException("Dish not found.");
            }

            // Check if the dish is already in the basket
            var existingBasketDish = basket.BasketDishes.FirstOrDefault(bd => bd.DishId == dishId);
            if (existingBasketDish != null)
            {
                // Update existing basket dish if found
                existingBasketDish.Quantity += quantity;
                existingBasketDish.Price = dish.Price * existingBasketDish.Quantity; // Recalculate price

                // Save changes after updating the dish
                _context.BasketDishes.Update(existingBasketDish);
                await _context.SaveChangesAsync();  // Save after updating the dish
            }
            else
            {
                // Add new dish to basket if not already present
                var newBasketDish = new BasketDish
                {
                    Id = Guid.NewGuid(),
                    BasketId = basket.Id,
                    DishId = dishId,
                    Quantity = quantity,
                    Price = dish.Price * quantity
                };
                basket.BasketDishes.Add(newBasketDish);

                // Save changes after adding the new dish
                _context.BasketDishes.Add(newBasketDish);
                await _context.SaveChangesAsync();  // Save after adding the dish
            }

            // Recalculate total price after all modifications
            basket.TotalPrice = basket.BasketDishes.Sum(bd => bd.Price);

            try
            {
                // Save changes for the basket after recalculating the total price
                _context.Baskets.Update(basket);
                await _context.SaveChangesAsync();  // Final save after all changes
            }
            catch (DbUpdateConcurrencyException ex)
            {
                // Handle concurrency exception
                var entry = ex.Entries.Single();
                var clientValues = (Basket)entry.Entity;
                var databaseValues = (Basket)entry.GetDatabaseValues().ToObject();

                throw new Exception("The basket was modified by another user. Please try again.");
            }
        }

        public async Task RemoveDishFromBasketAsync(int userId, Guid dishId, int quantity = 1, bool increase = true)
        {
            var basket = await _context.Baskets
                .Include(b => b.BasketDishes)
                .ThenInclude(bd => bd.Dish)
                .FirstOrDefaultAsync(b => b.UserId == userId);

            if (basket == null)
            {
                throw new KeyNotFoundException("Basket not found.");
            }

            var basketDish = basket.BasketDishes.FirstOrDefault(bd => bd.DishId == dishId);
            if (basketDish == null)
            {
                throw new KeyNotFoundException("Dish not found in the basket.");
            }

            if (increase)
            {
                // Decrement quantity and adjust price, or remove the dish if quantity becomes zero
                if (basketDish.Quantity > quantity)
                {
                    basketDish.Quantity -= quantity;
                    basketDish.Price = basketDish.Dish.Price * basketDish.Quantity; // Recalculate price
                }
                else
                {
                    basket.BasketDishes.Remove(basketDish);
                    _context.BasketDishes.Remove(basketDish); // Ensure it's removed from the database
                }
            }
            else
            {
                // Remove the dish entirely regardless of quantity
                basket.BasketDishes.Remove(basketDish);
                _context.BasketDishes.Remove(basketDish); // Ensure it's removed from the database
            }

            // Recalculate total price for the basket
            basket.TotalPrice = basket.BasketDishes.Sum(bd => bd.Price);

            // Save changes to the database
            _context.Baskets.Update(basket);
            await _context.SaveChangesAsync();
        }


    }
}
