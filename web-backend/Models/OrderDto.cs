namespace Mahmoud_Restaurant.Models
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public int UserId { get; set; }
        public DateTime DeliveryTime { get; set; }
        public DateTime OrderTime { get; set; }
        public string Status { get; set; }  // Use string for Status
        public double Price { get; set; }
        public string Address { get; set; }
    }
}
