import { PageLoader } from './router.js';
// js file to list the orders history

export function loadOrderPage() {
    const token = localStorage.getItem("JWT");
    const ordersContainer = document.getElementById("orders-container");

    if (!token) {
        alert('You are not authorized!');
        return;
    }

    fetch('https://{BACKEND_HOSTING}/api/order', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        data.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'card col-md-4';
            orderCard.dataset.id = order.id;

            const deliveryTime = new Date(order.deliveryTime).toLocaleString();
            const orderTime = new Date(order.orderTime).toLocaleString();

            orderCard.innerHTML = `
                <h2>Order ID: ${order.id}</h2>
                <p>Order Time: ${orderTime}</p>
                <p>Delivery Time: ${deliveryTime}</p>
                <p>Status: <span class="status ${order.status.toLowerCase()}">${order.status}</span></p>
                <p>Price: $${order.price}</p>
                ${order.status === 'InProcess' ? '<button class="confirm-btn" data-id="' + order.id + '">Confirm</button>' : ''}
            `;

            ordersContainer.appendChild(orderCard);

            orderCard.addEventListener('click', (event) => {
                if (event.target.tagName !== 'BUTTON') {
                    const orderId = orderCard.dataset.id;
                    const fullUrl = new URL(location.origin + "/order/" + orderId);
                    PageLoader.loadPage(fullUrl.pathname, fullUrl.search);
                }
            });
        });

        document.querySelectorAll('.confirm-btn').forEach(button => {
            button.addEventListener('click', event => {
                event.stopPropagation();
                const orderId = event.target.getAttribute('data-id');

                fetch(`https://{BACKEND_HOSTING}/api/order/${orderId}/status`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => {
                    if (response.ok) {
                        alert('Order confirmed!');
                        var fullUrl = new URL(location.origin + '/orders');
                        PageLoader.loadPage(fullUrl.pathname, "");
                    } else {
                        alert('Failed to confirm the order.');
                    }
                });
            });
        });
    })
    .catch(error => console.error('Error fetching orders:', error));
};
