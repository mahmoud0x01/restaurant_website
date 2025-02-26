// Function to extract the order ID from the URL path
function extractOrderIdFromUrl() {
    const urlPath = window.location.pathname;
    const pathParts = urlPath.split('/');
    const orderIdIndex = pathParts.findIndex(part => part === 'order') + 1;
    const orderId = pathParts[orderIdIndex];
    return orderId;
}

// Function to load and display the order details
function loadOrderDetails() {
    const orderId = extractOrderIdFromUrl();
    const token = localStorage.getItem("JWT");

    fetch(`https://{BACKEND_HOSTING}/api/order/${orderId}`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(order => {
        const orderDetailsContainer = document.getElementById('order-details-container');
        const deliveryTime = new Date(order.deliveryTime).toLocaleString();
        const orderTime = new Date(order.orderTime).toLocaleString();

        let dishesHtml = '';
        order.dishes.forEach(dish => {
            dishesHtml += `
                <div class="dish">
                    <img src="${dish.image}" alt="${dish.name}">
                    <h3>${dish.name}</h3>
                    <p>Amount: ${dish.amount}</p>
                    <p>Price: $${dish.price}</p>
                    <p>Total Price: $${dish.totalPrice}</p>
                </div>
            `;
        });

        orderDetailsContainer.innerHTML = `
            <h2>Order ID: ${order.id}</h2>
            <p>Order Time: ${orderTime}</p>
            <p>Delivery Time: ${deliveryTime}</p>
            <p>Status: <span class="status ${order.status.toLowerCase()}">${order.status}</span></p>
            <p>Price: $${order.price}</p>
            <p>Address: ${order.address}</p>
            <div class="dishes">
                ${dishesHtml}
            </div>
        `;
    })
    .catch(error => {
        console.error('Error fetching order details:', error);
        const orderDetailsContainer = document.getElementById('order-details-container');
        orderDetailsContainer.innerHTML = '<p>Failed to load order details.</p>';
    });
}

// Entrypoint function for setting up the order details page
export function setupOrderItempage() {
    loadOrderDetails();
}

// Initialize the page
//document.addEventListener('DOMContentLoaded', setupOrderDetailsPage);
