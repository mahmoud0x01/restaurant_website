import { SetupProfile } from "./profile.js"
import { SetupItem } from "./item.js"
import {setupOrderItempage} from "./orderitem.js"
import { SetupMenu } from "./main.js"
import { SetupLogin } from "./login.js"
import { InitNavbar } from "./navbar.js"
import { SetupRegister } from "./register.js";
import { SetupLogout } from "./logout.js";
import { loadCartItems } from "./cart.js";
import { loadOrderPage } from "./orders.js"

export class PageLoader{
    static endpoints = {
        profile : SetupProfile,
        item : SetupItem,
        login : SetupLogin,
        register : SetupRegister,
        logout : SetupLogout,
        cart : loadCartItems,
        orders : loadOrderPage,
        order : setupOrderItempage
    }

    static async loadPage(url, query, isBack = false, isFirstPage = false){
        console.log("Page loader works now!")
        InitNavbar();
        $('main').empty();
        if(!isBack && !isFirstPage){
            history.pushState(null, '', url + query)
        }
        let address = url.substring(1).split('/');
        let firstElement = address[0].toLowerCase();
        if(firstElement == ''){
            $('main').load('html/main.html', function (){
               SetupMenu(query);
            });
        }
        else if (firstElement in this.endpoints){
            $('main').load(`/html/${firstElement}.html`, this.endpoints[firstElement])
        }
        else{
            $('main').load('/html/notFound.html');
        }
    }
}