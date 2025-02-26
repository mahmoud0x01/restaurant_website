import { api } from "./api.js";
import { PageLoader } from './router.js';
import { updateCartCounter } from './navbar.js';

export function SetupMenu(query) {
    LoadDishes(query || '');
    AddSelectionButtonListener();
}

function LoadDishes(query) {
    SetSelections(query);
    let url = new URL(`${api}/api/dish/${query}`);
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(json => {
            for (let dish of json.dishes) {
                InitDishCard(dish);
            }
        })
        .catch(err => {
            alert(err);
        });
}

async function InitDishCard(dish) {
    let template = $("#card-template");
    let card = template.clone();
    card.attr("id", dish.id);

    card.find(".dish-title").text(dish.name);
    card.find(".dish-title").attr("data-id", dish.id);
    card.find(".dish-img").attr("src", dish.image);
    card.find(".dish-description").text(dish.description);
    card.find(".dish-price").text(dish.price);
    card.find(".dish-category").text(dish.category);
    card.find(".is-vegeterian").text(dish.vegetarian ? "Vegetarian" : "Not vegetarian");

    let user = JSON.parse(localStorage.getItem("user"));
    if (!user.auth) {
        card.find(".add-cart-btn").addClass("d-none");
    }
    card.find(".add-cart-btn").attr("data-dish-id", dish.id);
    card.find(".plus-btn").attr("data-dish-id", dish.id);
    card.find(".minus-btn").attr("data-dish-id", dish.id);

    // Check if the user can rate the dish
    const canRate = await checkRatingAbility(dish.id);
    if (canRate) {
        let ratingStars = createRatingStars(dish.rating); // Create stars with initial rating
        card.find(".card-body").append(ratingStars);
        setRatingListeners(card, dish.id, dish.rating); // Pass dish.rating to setRatingListeners
    }

    card.find(".add-cart-btn").on("click", function(event) {
        event.stopPropagation(); // Stop event propagation
        ToggleQuantityControls($(this).parent(),"on");
        ProcessAddToCartBtnClick(event);
    });

    card.on("click", ".plus-btn", function(event) {
        event.stopPropagation(); // Stop event propagation
        const quantityElement = $(this).siblings(".quantity");
        let quantity = parseInt(quantityElement.text());
        quantity++;
        quantityElement.text(quantity);
        ProcessAddToCartBtnClick(event);
    });

    card.on("click", ".minus-btn", function(event) {
        event.stopPropagation(); // Stop event propagation
        const quantityElement = $(this).siblings(".quantity");
        let quantity = parseInt(quantityElement.text());
        if (quantity > 1) {
            quantity--;
            quantityElement.text(quantity);
            ProcessremoveFromCartBtnClick(event,"true");
        }
        else {
            ToggleQuantityControls($(this).parent(),"off");
            ProcessremoveFromCartBtnClick(event);
        }
    });

    // Add click event handler for dish item
    card.on("click", function() {
        var dishId = $(this).find(".dish-title").data('id');
        var fullUrl = new URL(location.origin + "/item/" + dishId);
        PageLoader.loadPage(fullUrl.pathname, fullUrl.search);
    });

    card.removeClass("d-none");

    $("#dishes-container").append(card);
}

async function checkRatingAbility(dishId) {
    var apiUrl = `https://{BACKEND_HOSTING}/api/dish/${dishId}/rating/check`;
    var token = localStorage.getItem("JWT");

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/plain'
            }
        });

        if (response.ok) {
            const responseData = await response.text();
            return responseData.trim() === 'true';
        } else {
            console.error("An error occurred while checking rating ability:", response.status);
            return false;
        }
    } catch (error) {
        console.error("An error occurred while checking rating ability:", error);
        return false;
    }
}

function createRatingStars(initialRating = 0) {
    let starContainer = $('<div class="rating-stars"></div>');
    for (let i = 1; i <= 5; i++) {
        let star = $('<i class="fa fa-star"></i>').attr('data-rating', i);
        if (i <= initialRating) {
            star.css('color', '#f7b731');
        }
        starContainer.append(star);
    }
    return starContainer;
}

function setRatingListeners(card, dishId, initialRating = 0) {
    let currentRating = initialRating; // Initialize with the existing rating

    card.find('.fa-star').mouseenter(function(event) {
        event.stopPropagation();
        let hoverRating = $(this).data('rating');
        card.find('.fa-star').each(function(index) {
            $(this).css('color', index < hoverRating ? '#f7b731' : '');
        });
    });

    card.find('.fa-star').mouseleave(function(event) {
        event.stopPropagation();
        let hoverRating = $(this).data('rating');
        card.find('.fa-star').each(function(index) {
            $(this).css('color', index < hoverRating ? '#f7b731' : '');
        });
    });

    card.find('.fa-star').click(function(event) {
    event.stopPropagation();
    let rating = $(this).data('rating');
    rateDish(dishId, rating)
        .then(() => {
            currentRating = rating; // Update current rating
            card.find('.fa-star').each(function(index) {
                $(this).css('color', index < currentRating ? '#f7b731' : '');
            });
        })
        .catch(error => {
            console.error("Failed to set rating:", error);
        });
});
}

function rateDish(dishId, rating) {
    var apiUrl = `https://{BACKEND_HOSTING}/api/dish/${dishId}/rating?ratingScore=${rating}`;
    var token = localStorage.getItem("JWT");

    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        body: ''
    })
    .then(response => {
        if (response.ok) {
            // Rating set successfully
            console.log(`Rating set successfully for dish ${dishId} with rating ${rating}`);
            return response.json(); // Optionally return the response JSON
        } else {
            // Handle error response
            console.error(`Failed to set rating for dish ${dishId}`);
            throw new Error('Failed to set rating');
        }
    });
}

function ProcessAddToCartBtnClick(event) {
    var dishId = $(event.currentTarget).data("dish-id");
    console.log(dishId);
    var apiUrl = `https://{BACKEND_HOSTING}/api/basket/dish/${dishId}`;
    var token = localStorage.getItem("JWT");

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        body: ''
    })
    .then(response => {
        if (response.ok) {
            // Handle successful response
            console.log("Dish added to cart successfully.");
            updateCartCounter();
        } else {
            // Handle error response
            console.log("Failed to add dish to cart.");
        }
    })
    .catch(error => {
        // Handle network error
        console.error("An error occurred while adding dish to cart:", error);
    });
}

function ProcessremoveFromCartBtnClick(event, increasevar="false") {
    var dishId = $(event.currentTarget).data("dish-id");
    console.log(dishId);
    var apiUrl = `https://{BACKEND_HOSTING}/api/basket/dish/${dishId}?increase=${increasevar}`;
    var token = localStorage.getItem("JWT");

    fetch(apiUrl, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        body: ''
    })
    .then(response => {
        if (response.ok) {
            // Handle successful response
            console.log("Dish removed from cart successfully.");
            updateCartCounter();
        } else {
            // Handle error response
            console.log("Failed to remove dish from cart.");
        }
    })
    .catch(error => {
        // Handle network error
        console.error("An error occurred while adding dish to cart:", error);
    });
}

function ToggleQuantityControls(container, key) {
  const quantityControls = container.find(".quantity-controls");
  const addCartButton = container.find(".add-cart-btn");

  if (key === "on") {
    // Show quantity controls and hide add to cart button
    quantityControls.toggle("d-none");
    addCartButton.addClass("d-none");
    console.log("executed toggle successfully on");
  } else {
    // Show add to cart button and hide quantity controls
    addCartButton.removeClass("d-none");
    quantityControls.toggle("d-none");
    console.log("executed toggle successfully off");
  }
}


function AddSelectionButtonListener() {
    $("#apply").click(function () {
        let query = SelectionToQuery();
        PageLoader.loadPage("/", "?" + query);
    });
}

function SelectionToQuery() {
    let obj = {
        categories: $("#dish-select").val(),
        sorting: $("#sorting-select").val(),
        vegetarian: $("#isVegetarian").prop('checked')
    };
    console.log(obj);
    let url = $.param(obj);
    console.log(url);
    return url.replaceAll("%5B%5D", '');
}

function SetSelections(query) {
    let obj = ParseQueryToObj(query);
    console.log(obj);
    $.each(obj.categories, function(i, e) {
        $("#dish-select option[value='" + e + "']").prop("selected", true);
    });
    $("#sorting-select option[value='" + obj.sorting + "']").prop("selected", true);
    $("#isVegetarian").prop('checked', obj.vegetarian === 'true');
}

function ParseQueryToObj(queryString) {
    if (queryString == "") return {};
    const pairs = queryString.substring(1).split('&');
    var array = pairs.map((el) => {
        const parts = el.split('=');
        return parts;
    });
    let obj = {
        categories: []
    };
    for (const pair of array) {
        if (pair[0] === 'categories') {
            obj[pair[0]].push(pair[1]);
        } else {
            obj[pair[0]] = pair[1];
        }
    }
    return obj;
}
