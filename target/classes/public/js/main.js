/**
 * @file main.js
 * @description Application entry point. 
 * Imports the controller and calls init() once the DOM is ready.
 * This is the ONLY script tag needed in index.html.
 */

import { init } from "./controllers/app.controller.js";

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
