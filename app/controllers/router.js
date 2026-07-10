/**
 * controllers/router.js
 * 
 * Handles URL-based routing, history, and navigation.
 */
import { renderHome, renderAbout, renderNotFound } from './page.js';
import { renderPosts } from './posts.js';

const contentElement = document.getElementById('content');

// 1. Define Routes: Maps URL paths to controller functions.
const routes = {
    '/': () => renderHome(contentElement),
    '/posts': () => renderPosts(contentElement),
    '/about': () => renderAbout(contentElement)
};

// 2. The Router: Finds the correct view for the current path and renders it.
const router = () => {
    const path = window.location.pathname;
    // Find the view for the current path, or fall back to the Not Found view.
    const view = routes[path] || (() => renderNotFound(contentElement));
    view();
};

// 3. Initialize Router: Sets up all event listeners for navigation.
const initializeRouter = () => {
    // Handle browser back/forward button navigation.
    window.addEventListener('popstate', router);

    // Intercept clicks on links with the 'data-link' attribute.
    document.body.addEventListener('click', e => {
        const link = e.target.closest('[data-link]');
        if (link) {
            e.preventDefault(); // Stop the browser from doing a full page reload.
            history.pushState(null, '', link.href); // Update the URL using the History API.
            router(); // Render the new view.
        }
    });

    router(); // Render the initial view based on the URL loaded.
};

export { initializeRouter };