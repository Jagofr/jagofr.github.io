/**
 * controllers/page.js
 * 
 * Handles rendering logic for static pages.
 */

const renderHome = (contentElement) => {
    contentElement.innerHTML = `
        <h2>Welcome to the Void</h2>
        <p>This is the landing page. You can find my ramblings under the posts section.</p>
    `;
};

const renderAbout = (contentElement) => {
    contentElement.innerHTML = `
        <h2>About This Place</h2>
        <p>A metaphorical online space where no one cares & I can ramble without judgement.</p>
    `;
};

const renderNotFound = (contentElement) => {
    contentElement.innerHTML = `<h2>404 - Not Found</h2><p>The page you are looking for does not exist in this void.</p>`;
};

export { renderHome, renderAbout, renderNotFound };