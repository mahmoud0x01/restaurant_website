using Mahmoud_Restaurant.Models;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Bcpg;

namespace Mahmoud_Restaurant.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Dish> Dishes { get; set; }  // gen db table
        public DbSet<Rating> Ratings { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Basket> Baskets { get; set; }
        public DbSet<BasketDish> BasketDishes { get; set; } // New table for Basket-Dish relationships
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Order - Basket relationship (one-to-one, optional)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Basket)
                .WithMany()  // No collection in Basket for orders
                .HasForeignKey(o => o.BasketId)
                .OnDelete(DeleteBehavior.SetNull);  // Basket can be null when the order is created

            // BasketDish - Basket relationship (many-to-one)
            modelBuilder.Entity<BasketDish>()
                .HasOne(bd => bd.Basket)
                .WithMany(b => b.BasketDishes)  // Basket has a collection of BasketDishes
                .HasForeignKey(bd => bd.BasketId)
                .OnDelete(DeleteBehavior.Cascade);  // Cascade delete when a Basket is removed

            // BasketDish - Dish relationship (many-to-one)
            modelBuilder.Entity<BasketDish>()
                .HasOne(bd => bd.Dish)
                .WithMany()  // Dish doesn't have a collection of BasketDishes
                .HasForeignKey(bd => bd.DishId)
                .OnDelete(DeleteBehavior.Restrict);  // Don't delete a Dish if it's used in a BasketDish
        }
    }
}