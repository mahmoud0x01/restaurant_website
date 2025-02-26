using System.ComponentModel.DataAnnotations;

namespace Mahmoud_Restaurant.Models
{
    public class Basket
    {
        public Guid Id { get; set; }  // Unique identifier for the basket

        [Required]
        public int UserId { get; set; }  // User who owns this basket

        public DateTime CreatedAt { get; set; }  // When the basket was created

        public DateTime? UpdatedAt { get; set; }  // Last updated time

        public double TotalPrice { get; set; }  // Total price of items in the basket

        // Navigation property for BasketDish
        public List<BasketDish> BasketDishes { get; set; }  // Items in the basket
    }

    public class BasketDish
    {
        public Guid Id { get; set; }  // Unique identifier for the basket dish item

        [Required]
        public Guid BasketId { get; set; }  // Link to the basket

        [Required]
        public Guid DishId { get; set; }  // Link to the dish in the basket

        [Required]
        public int Quantity { get; set; }  // Quantity of the dish in the basket

        public double Price { get; set; }  // Price of this quantity of the dish (could be calculated as dish price * quantity)

        // Navigation properties
        public Basket Basket { get; set; }  // Navigation back to the Basket
        public Dish Dish { get; set; }  // Navigation to the Dish
    }
}
