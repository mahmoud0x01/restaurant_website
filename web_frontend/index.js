import { PageLoader } from "./js/router.js";

$(document).ready(function (){
    addEventListener('popstate', () => {
        PageLoader.loadPage(location.pathname, location.search, true)
    })

    PageLoader.loadPage(location.pathname, location.search)
});