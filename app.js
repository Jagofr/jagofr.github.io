/**
 * Main Application Script for Void0fr
 * 
 * This is the entry point of the application. It imports and initializes the router.
 */
import { initializeRouter } from './app/controllers/router.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the router once the DOM is fully loaded.
    initializeRouter();
});