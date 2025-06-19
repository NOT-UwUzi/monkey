const CacheName = "stopify";
const CacheAssets = [
    './css/login.css',
    './css/style.css',
    './css/songs.css',

    './index.html',
    './loginpage.html',
    './settings.html',

    './js/login.js',
    './js/settings.js',
    './js/songs.js',

    './pfps/anonymous.webp',
    './pfps/panda.jpg',
    './pfps/panda.png',

    './music/allthatsleft.jpg',
    './music/ariamath.jpg',
    './music/chosen.jpg',
    './music/closetothesun.jpg',
    './music/creator.jpg',
    './music/deepenergy.jpg',
    './music/escapinggravity.jpg',
    './music/excuse.jpg',
    './music/hidingintheblue.webp',
    './music/key.jpg',
    './music/miceonvenus.jpg',
    './music/minecraft.jpg',
    './music/monody.jpg',
    './music/moogcity.jpg',
    './music/neverbealone.webp',
    './music/nevergonnagiveyouup.jpg',
    './music/otherside.jpg',
    './music/passages.jpg',
    './music/raytracer.webp',
    './music/stargazer.jpg',
    './music/stoneheads.jpg',
    './music/stopify.png',
    './music/subwooferlullaby.jpg',
    './music/sundown.jpg',
    './music/sweden.jpg',
    './music/threatfarmarrays.jpg',
    './music/threatshoreline.jpg',
    './music/threatskyislands.jpg',
    './music/unseenlands.jpg',
    './music/urbanjungle.jpg',
    './music/wellmeetagain.jpg',
    './music/wethands.jpg',
    './music/whatfateaslugcat.jpg',

    './music/allthatsleft.mp3',
    './music/ariamath.mp3',
    './music/chosen.mp3',
    './music/closetothesun.mp3',
    './music/creator.mp3',
    './music/deepenergy.mp3',
    './music/escapinggravity.mp3',
    './music/excuse.mp3',
    './music/hidingintheblue.webp',
    './music/key.mp3',
    './music/miceonvenus.mp3',
    './music/minecraft.mp3',
    './music/monody.mp3',
    './music/moogcity.mp3',
    './music/neverbealone.webp',
    './music/nevergonnagiveyouup.mp3',
    './music/otherside.mp3',
    './music/passages.mp3',
    './music/raytracer.webp',
    './music/stargazer.mp3',
    './music/stoneheads.mp3',
    './music/stopify.png',
    './music/subwooferlullaby.mp3',
    './music/sundown.mp3',
    './music/sweden.mp3',
    './music/threatfarmarrays.mp3',
    './music/threatshoreline.mp3',
    './music/threatskyislands.mp3',
    './music/unseenlands.mp3',
    './music/urbanjungle.mp3',
    './music/wellmeetagain.mp3',
    './music/wethands.mp3',
    './music/whatfateaslugcat.mp3',

    './manifest.json',

    './'
];

const IgnoreCache = [
    "/api",
];
const DisabledOffline = [
    "/map",
    "/html/map.html",
];

async function cacheAll() {
    if (!navigator.onLine) { return; };
    try {
        const cache = await caches.open(CacheName);
        await cache.addAll(CacheAssets);
        return;
    } catch (error) {
        throw new Error(`Failed to cache ${error}`);
    };
};

async function checkCache(event) {
    try {
        if (DisabledOffline.some((ref) => event.request.url.startsWith(ref))) {
            throw new Error("Page not accessible offline");
        };
        const cache = await caches.open(CacheName);
        let response = await cache?.match(event.request);
        if (!response) {
            response = await fetch(event.request);
            if (!response || !response.ok) {
                throw new Error("No cache found and unable to fetch");
            };
        };
        return response;
    } catch (error) {
        // console.error(error);

        const cache = await caches.open(CacheName);
        const response = await cache.match("./html/status/offline.html");
        return response || new Response("No Internet", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" },
        });
    };
};

async function updateCaches() {
    caches.keys().then((keys) => {
        return Promise.all(keys.map(async (key) => {
            if (key != CacheName) { return await caches.delete(key); };
        }));
    }).then(() => {
        self.clients.claim();
    });
};

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(cacheAll().then(() => {
        console.log("ALL RESOURCES CACHED");
    }));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(updateCaches().then(() => {
        self.clients.claim();
        console.log("CACHE UPDATED");
    }));
});

self.addEventListener('fetch', (event) => {
    if (new URL(event.request.url).origin != self.location.origin ||
        IgnoreCache.some((path) => new URL(event.request.url).pathname.startsWith(path))) { return; };
    event.respondWith(checkCache(event));
});