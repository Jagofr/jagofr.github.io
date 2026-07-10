/**
 * app/services/dataService.js
 * 
 * Manages post data, implementing an offline-first caching strategy
 * using IndexedDB.
 */

const DB_NAME = 'Void0frDB';
const DB_VERSION = 1;
const STORE_NAME = 'posts';

// Helper to open the IndexedDB database.
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // This event runs only when the DB is created or version is upgraded.
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                // We use 'slug' as the unique key for each post object.
                db.createObjectStore(STORE_NAME, { keyPath: 'slug' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject('IndexedDB error: ' + event.target.errorCode);
    });
};

// Fetches the list of all posts from the server.
const fetchPostsFromServer = async () => {
    // This now points to the future API endpoint instead of a static file.
    const response = await fetch('/api/v1/posts');
    if (!response.ok) {
        throw new Error('Network response was not ok.');
    }
    return await response.json();
};

// Retrieves all posts currently stored in our local IndexedDB.
const getPostsFromDB = async (db) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject('Failed to get posts from DB: ' + event.target.errorCode);
    });
};

// Replaces all posts in the DB with a fresh list from the server.
const updatePostsInDB = async (db, posts) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.clear(); // Clear old posts before adding new ones.
        posts.forEach(post => store.put(post));
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject('Failed to update posts in DB: ' + event.target.errorCode);
    });
};

/**
 * Gets all posts, implementing the "offline-first" strategy.
 * - If online, it fetches from the server and updates the local DB.
 * - If fetch fails or offline, it returns data from the local DB.
 */
export const getPosts = async () => {
    const db = await openDB();

    if (navigator.onLine) {
        try {
            console.log('Online. Fetching latest posts...');
            const serverPosts = await fetchPostsFromServer();
            await updatePostsInDB(db, serverPosts);
            console.log('Local post database updated from server.');
            return serverPosts;
        } catch (error) {
            console.warn('Failed to fetch from server, using local posts as fallback.', error);
            const localPosts = await getPostsFromDB(db);
            if (localPosts.length > 0) return localPosts;
            throw new Error('Failed to fetch posts and no local data available.');
        }
    } else {
        console.log('Offline. Using local post database.');
        const localPosts = await getPostsFromDB(db);
        if (localPosts.length > 0) return localPosts;
        throw new Error('You are offline and no posts have been saved locally yet.');
    }
};