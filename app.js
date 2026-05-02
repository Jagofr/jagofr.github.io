/**
 * Jamie's Blog - Vanilla SPA Engine
 * No frameworks. No fluff. 
 */

const container = document.getElementById('view-container');
let postsCache = null;

// 1. DATA FETCHING & SORTING
async function getPosts() {
    if (postsCache) return postsCache;

    try {
        const res = await fetch('./posts.json');
        const posts = await res.json();

        // Sort: Newest First (Date + Time)
        postsCache = posts.sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.time}`);
            const dateTimeB = new Date(`${b.date}T${b.time}`);
            return dateTimeB - dateTimeA;
        });

        return postsCache;
    } catch (err) {
        console.error("Failed to load posts.json", err);
        return [];
    }
}

// 2. ROUTE DEFINITIONS
const routes = {
    '#home': () => {
        container.innerHTML = `
            <h1>Home</h1>
            <p>Welcome. This is a framework-free zone.</p>
            <p>Building things from the ground up because it's the only way to stay sane.</p>
        `;
    },
    '#about': async () => {
        const res = await fetch('./pages/about.html');
        container.innerHTML = res.ok ? await res.text() : '<h1>About</h1><p>Web Developer based in Kingston.</p>';
    },
    '#posts': async () => {
        const posts = await getPosts();
        const list = posts.map(p => `
            <li class="post-item">
                <span class="post-meta">${p.date} @ ${p.time.substring(0, 5)}</span><br>
                <a href="#post/${p.slug}" class="post-link">${p.title}</a>
                <p class="post-summary">${p.summary}</p>
            </li>
        `).join('');

        container.innerHTML = `<h1>Archive</h1><ul class="post-list">${list}</ul>`;
    }
};

// 3. THE ROUTER ENGINE
async function router() {
    const hash = window.location.hash || '#home';
    
    // Handle Individual Blog Posts
    if (hash.startsWith('#post/')) {
        const slug = hash.split('/')[1];
        
        // Fetch post data and content simultaneously
        const [posts, res] = await Promise.all([
            getPosts(),
            fetch(`./posts/${slug}.html`)
        ]);

        if (res.ok) {
            const postData = posts.find(p => p.slug === slug);
            const bodyContent = await res.text();

            // Inject Template + Body Content
            container.innerHTML = `
                <article class="post-article" id="post-${slug}">
                    <header class="post-header">
                        <h1>${postData ? postData.title : 'Untitled'}</h1>
                        <div class="post-metadata">
                            <time>${postData ? postData.date : ''} | ${postData ? postData.time : ''}</time>
                        </div>
                        <p class="post-description"><em>${postData ? postData.summary : ''}</em></p>
                    </header>
                    <hr>
                    <div id="post-content">
                        ${bodyContent}
                    </div>
                </article>
            `;

            // Update Meta
            document.title = postData ? `${postData.title} | Jamie's Blog` : "Jamie's Blog";
            window.scrollTo(0, 0);
        } else {
            container.innerHTML = '<h1>404</h1><p>Post not found.</p>';
        }
        return;
    }

    // Handle Static Routes
    const routeAction = routes[hash];
    if (routeAction) {
        await routeAction();
        document.title = "Jamie's Blog";
        window.scrollTo(0, 0);
    } else {
        container.innerHTML = '<h1>404</h1><p>Page not found.</p>';
    }
}

// 4. EVENT LISTENERS
window.addEventListener('hashchange', router);
window.addEventListener('load', router);