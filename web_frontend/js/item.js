// Function to extract the dish ID from the URL path
function extractDishIdFromUrl() {
  const urlPath = window.location.pathname;
  const pathParts = urlPath.split('/');
  const dishIdIndex = pathParts.findIndex(part => part === 'item') + 1;
  const dishId = pathParts[dishIdIndex];
  console.log(dishId);
  return dishId;
}

// Function to load and display the item details
function loadItemDetails() {
  const dishId = extractDishIdFromUrl();
  // Make an API request to fetch the item details based on the dishId
  fetch(`https://{BACKEND_HOSTING}/api/dish/${dishId}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to fetch item details');
      }
    })
    .then(item => {
      // Update the item-container with the fetched item details
      const itemContainer = document.getElementById('item-container');
      if (itemContainer) {
        itemContainer.innerHTML = `
          <div>
            <h2>${item.name}</h2>
            <img src="${item.image}" alt="${item.name}">
            <p>Description: ${item.description}</p>
            <p>Price: ${item.price}</p>
            <p>Category: ${item.category}</p>
            <p>${item.vegetarian ? 'Vegetarian' : 'Not Vegetarian'}</p>
          </div>
        `;
      } else {
        throw new Error('item-container element not found');
      }
    })
    .catch(error => {
      console.error(error);
      // Display an error message if item details cannot be loaded
      const itemContainer = document.getElementById('item-container');
      if (itemContainer) {
        itemContainer.innerHTML = '<p>Failed to load item details.</p>';
      } else {
        console.error('item-container element not found');
      }
    });
}

// Entrypoint function for setting up the item page
export function SetupItem() {
  loadItemDetails();
}