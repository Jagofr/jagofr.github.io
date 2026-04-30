const container = document.getElementById('view-container');
let postsCache = null;

// Helper to get posts, caching them so we don't fetch every time
async function getPosts() {
    if (postsCache) return postsCache;
    const res = await fetch('posts.json');
    const posts = await res.json();
    
    // Sort newest first using both date and time
    postsCache = posts.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
    });
    
    return postsCache;
}

const routes = {
    '#home': () => {
        container.innerHTML = `<h1>Home</h1><p>Welcome to my corner of the web. No frameworks, just code.</p>`;
    },
    '#about': async () => {
        const res = await fetch('pages/about.html');
        container.innerHTML = res.ok ? await res.text() : '<h1>About Me</h1><p>Working on it!</p>';
    },
    '#posts': async () => {
        const posts = await getPosts();
        const list = posts.map(p => `
            <li>
                <strong>${p.date}</strong> [${p.time.substring(0, 5)}]: 
                <a href="#post/${p.slug}">${p.title}</a> 
                <br><small>${p.summary}</small>
            </li>`).join('');
        
        container.innerHTML = `<h1>Blog Posts</h1><ul class="post-list">${list}</ul>`;
    }
};

async function router() {
    const hash = window.location.hash || '#home';
    
    if (hash.startsWith('#post/')) {
        const slug = hash.split('/')[1];
        const [posts, res] = await Promise.all([
            getPosts(),
            fetch(`posts/${slug}.html`)
        ]);

        if (res.ok) {
            // 1. Inject the HTML content
            container.innerHTML = await res.text();

            // 2. Find the metadata for this slug
            const postData = posts.find(p => p.slug === slug);
            
            // 3. Update the template elements if they exist
            if (postData) {
                const titleEl = document.getElementById('title');
                const summaryEl = document.getElementById('summary');
                const dateEl = document.getElementById('post-date'); // Added for flavor

                if (titleEl) titleEl.textContent = postData.title;
                if (summaryEl) summaryEl.textContent = postData.summary;
                if (dateEl) dateEl.textContent = `${postData.date} @ ${postData.time}`;
                
                // Update browser tab title
                document.title = `${postData.title} | Jamie's Blog`;
            }
        } else {
            container.innerHTML = '<h1>404</h1><p>Post not found.</p>';
        }
        return;
    }

    const routeAction = routes[hash];
    if (routeAction) {
        await routeAction();
        document.title = "Jamie's Blog";
    } else {
        container.innerHTML = '<h1>404</h1><p>Page not found.</p>';
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);