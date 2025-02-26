import { PageLoader } from './router.js';
// Function to fetch cart items from the API
async function fetchCartItems() {
  var token = localStorage.getItem("JWT");
  try {
    const response = await fetch("https://{BACKEND_HOSTING}/api/basket", {
      headers: {
        "accept": "text/plain",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const cartItems = await response.json();
    return cartItems;
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return [];
  }
}

// Function to render the cart items
function renderCartItems(cartItems) {
  const cartItemsContainer = document.getElementById("cart-items-container");
  cartItemsContainer.innerHTML = "";

  cartItems.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.classList.add("card", "mb-3");

    itemElement.innerHTML = `
      <div class="row no-gutters">
        <div class="col-md-4">
          <img src="${item.image}" class="card-img" alt="${item.name}">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text">Price: $${item.price.toFixed(2)}</p>
            <p class="card-text">Total: $${item.totalPrice.toFixed(2)}</p>
            <p class="card-text">Amount: ${item.amount}</p>
          </div>
        </div>
      </div>
    `;

    cartItemsContainer.appendChild(itemElement);
  });
}

function getDeliveryInfo() {
  // Create a container for the delivery options
  const deliveryInfoContainer = document.createElement("div");
  deliveryInfoContainer.classList.add("delivery-info-container", "cart-item");

  // Create a label and a select element for the delivery time
  const deliveryTimeLabel = document.createElement("label");
  deliveryTimeLabel.classList.add("cart-item-label");
  deliveryTimeLabel.textContent = "Delivery Time:";

  const deliveryTimeSelect = document.createElement("select");
  deliveryTimeSelect.classList.add("delivery-time-select", "cart-item-input");

  // Add options for different delivery times
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Novosibirsk" });
  const currentDate = new Date(currentTime);
  const timeOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
  const options = [
    "1 hour",
    "2 hours",
    "3 hours",
    "4 hours",
    "5 hours",
    "6 hours",
  ];
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    const deliveryTime = option.includes("Immediately")
      ? new Date(currentDate.getTime() + timeOffset).toISOString().slice(0, 16)
      : new Date(currentDate.getTime() + timeOffset + parseInt(option) * 60 * 60 * 1000).toISOString().slice(0, 16);
    optionElement.value = deliveryTime;
    optionElement.textContent = `${option} (${new Date(deliveryTime).toLocaleString("en-US", { timeZone: "Asia/Novosibirsk" })})`;
    deliveryTimeSelect.appendChild(optionElement);
  });

  // Create a label and an input element for the address
  const addressLabel = document.createElement("label");
  addressLabel.classList.add("cart-item-label");
  addressLabel.textContent = "Delivery Address:";

const addressInput = document.createElement("textarea");
addressInput.classList.add("delivery-address-input", "cart-item-input");
addressInput.rows = 1;
addressInput.placeholder = "Enter delivery address";

// Apply inline styles
addressInput.style.width = "100%";
addressInput.style.padding = "10px";
addressInput.style.borderRadius = "5px";
addressInput.style.border = "1px solid #ccc";
addressInput.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
addressInput.style.fontSize = "16px";

  // Append the elements to the container
  deliveryInfoContainer.appendChild(deliveryTimeLabel);
  deliveryInfoContainer.appendChild(deliveryTimeSelect);
  deliveryInfoContainer.appendChild(addressLabel);
  deliveryInfoContainer.appendChild(addressInput);

  // Append the container to the DOM
  const cartContainer = document.getElementById("cart-items-container");
  cartContainer.appendChild(deliveryInfoContainer);

  // Return a promise that resolves with the user's input
  return new Promise((resolve) => {
    const placeOrderBtn = document.getElementById("place-order-btn");
    placeOrderBtn.addEventListener("click", () => {
      const deliveryTime = deliveryTimeSelect.value;
      const address = addressInput.value;
      deliveryInfoContainer.remove();
      resolve({ deliveryTime, address });
    });
  });
}
// Function to place an order
async function placeOrder() {
  const token = localStorage.getItem("JWT");
  try {
    // Get the delivery time and address from the user
    const { deliveryTime, address } = await getDeliveryInfo();

    const response = await fetch("https://{BACKEND_HOSTING}/api/order", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        deliveryTime,
        address,
      }),
    });

    if (response.ok) {
      alert("Order places Successfully");
      var fullUrl = new URL(location.origin + '/profile');
      PageLoader.loadPage(fullUrl.pathname, "");
    } else {
      const data = await response.json();
      const orderErrorElement = document.getElementById("order-error");
      orderErrorElement.textContent = data.message || "Error making order.";
    }
  } catch (error) {
    console.error("Error placing order:", error);
    const orderErrorElement = document.getElementById("order-error");
    orderErrorElement.textContent = "Error making order.";
  }
}

// Fetch and render the cart items
export async function loadCartItems() {
  const cartItems = await fetchCartItems();
  renderCartItems(cartItems);

  // Add event listener for the Place Order button
  const placeOrderBtn = document.getElementById("place-order-btn");
  placeOrderBtn.addEventListener("click", placeOrder);
}