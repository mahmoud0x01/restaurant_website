import { checkAuthorization } from "./authorization.js";
import { PageLoader } from './router.js';

export function InitNavbar() {
    checkAuthorization();
    $("#navbar-container").load('/Common/navbar.html', function (data) {
        SetNavLinksEventListeners();
        let user = JSON.parse(localStorage.getItem("user"));
        if (!user.auth) { // user not auth
            $("#profile-link").addClass("d-none"); //means to remove the element appearance
            $("#logout-link").addClass("d-none");
            $("#orders-link").addClass("d-none");
            $("#cart-link").addClass("d-none");
            $("#login-link").removeClass("d-none"); 
        } else {
            $("#orders-link").removeClass("d-none");
            $("#cart-link").removeClass("d-none");
            $("#profile-link").removeClass("d-none");
            $("#logout-link").removeClass("d-none");
            $("#login-link").addClass("d-none");
            updateCartCounter();
        }
    });
}

function SetNavLinksEventListeners() {
    var links = $("a");
    for (let link of links) {
        $(link).click(function (e) {
            e.preventDefault();
            var url = $(e.target).attr("href");
            var fullUrl = new URL(location.origin + url);
            PageLoader.loadPage(fullUrl.pathname, fullUrl.search)
        });
    }
}

export function updateCartCounter() {
    const token = localStorage.getItem("JWT");
    if (token) {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
        };
        $.ajax({
            url: 'https://{BACKEND_HOSTING}/api/basket',
            headers: headers,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                if (Array.isArray(response)) {
                    const cartItems = response.reduce((total, item) => total + item.amount, 0);
                    if (cartItems >= 0) {
                        $("#cart-counter").text(cartItems);
                    } else {
                        $("#cart-counter").text("0");
                    }
                } else {
                    const cartItems = parseInt(response.amount);
                    if (!isNaN(cartItems) && cartItems >= 0) {
                        $("#cart-counter").text(cartItems);
                    } else {
                        $("#cart-counter").text("0");
                    }
                }
            },
            error: function (xhr, status, error) {
                console.error(error);
            }
        });
    }
}