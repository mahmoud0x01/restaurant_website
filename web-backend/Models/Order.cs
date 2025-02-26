using Org.BouncyCastle.Bcpg;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Mahmoud_Restaurant.Models
{
    public class Order
    {
        public Guid Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public DateTime DeliveryTime { get; set; }

        [Required]
        public DateTime OrderTime { get; set; }

        [Required]
        public OrderStatus Status { get; set; }

        [Required]
        public double Price { get; set; }

        [Required]
        public string Address { get; set; }

        // Link to Basket for pending orders
        public Guid? BasketId { get; set; }  // Nullable, as orders may not always have a basket
        public Basket Basket { get; set; }   // Navigation property to Basket (if any)
    }


    public enum OrderStatus
    {
        Pending,
        Confirmed,
        Delivered
    }
}
