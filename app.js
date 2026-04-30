const container = document.getElementById('view-container');

const routes = {
    '#home': () => {
        container.innerHTML = `<h1>Home</h1><p>Welcome to my corner of the web. No frameworks, just code.</p>`;
    },
    '#about': async () => {
        const res = await fetch('pages/about.html');
        container.innerHTML = res.ok ? await res.text() : '<h1>About Me</h1><p>Working on it!</p>';
    },
    '#posts': async () => {
        const res = await fetch('posts.json');
        const posts = await res.json();
        // Sort newest first
        const list = posts.sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(p => `<li>${p.date}: <a href="#post/${p.slug}">${p.title}</a> - <em>${p.summary}</em></li>`)
            .join('');
        container.innerHTML = `<h1>Blog Posts</h1><ul>${list}</ul>`;
    }
};

async function router() {
    const hash = window.location.hash || '#home';
    
    // Check for dynamic post routes
    if (hash.startsWith('#post/')) {
        const slug = hash.split('/')[1];
        const res = await fetch(`posts/${slug}.html`);
        container.innerHTML = res.ok ? await res.text() : '<h1>404</h1><p>Post not found.</p>';
        return;
    }

    // Check for static routes
    const routeAction = routes[hash];
    if (routeAction) {
        await routeAction();
    } else {
        container.innerHTML = '<h1>404</h1><p>Page not found.</p>';
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);