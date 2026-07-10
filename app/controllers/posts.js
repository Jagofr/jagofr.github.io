/**
 * controllers/posts.js
 * 
 * Handles rendering logic for blog posts.
 */
import { getPosts } from './dataService.js';

const renderPosts = async (contentElement) => {
    // This view fetches data and then renders the list.
    contentElement.innerHTML = `<h2>All Posts</h2><p>Loading...</p>`;
    try {
        const posts = await getPosts();

        if (!posts || posts.length === 0) {
            contentElement.innerHTML = `<h2>All Posts</h2><p>No posts found.</p>`;
            return;
        }

        const postListHtml = posts.map(post => `
            <article class="post-item">
                <a href="/posts/${post.slug}" data-link class="post-link">${post.title}</a>
                <p class="post-meta">Published on ${new Date(post.date).toLocaleDateString()}</p>
                <p class="post-summary">${post.summary}</p>
            </article>
        `).join('');

        contentElement.innerHTML = `<h2>All Posts</h2><div class="post-list">${postListHtml}</div>`;
    } catch (error) {
        console.error('Failed to render posts:', error);
        // Display a more useful error message to the user.
        contentElement.innerHTML = `<div class="error-message"><p>Error loading posts.</p><p><em>${error.message}</em></p></div>`;
    }
};

export { renderPosts };