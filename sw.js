"use strict";

var CACHE_VERSION = "mythomytho-v1.6.1";
var APP_SHELL_CACHE = CACHE_VERSION + "-shell";
var RUNTIME_CACHE = CACHE_VERSION + "-runtime";

// Fichiers indispensables : si l'un d'eux échoue, l'installation échoue.
var APP_SHELL_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./js/main.js",
    "./js/core.js",
    "./js/theme.js",
    "./js/themes.js",
    "./js/setup.js",
    "./js/options.js",
    "./js/balance.js",
    "./js/groups.js",
    "./js/audio.js",
    "./js/pwa.js",
    "./js/game-chunk.js",
    "./js/game.js",
    "./js/timer.js",
    "./js/cards.js",
    "./js/vote.js",
    "./js/wakelock.js",
    "./js/guess.js",
    "./js/journal.js",
    "./js/questions.js",
    "./js/picker.js",
    "./js/missions.js",
    "./js/journal-ui.js",
    "./js/custom-ui.js",
    "./manifest.json",
    "./words.json",
    "./missions.json"
];

// Icônes : mises en cache au mieux, sans jamais bloquer l'installation.
var OPTIONAL_FILES = [
    "./assets/logo.svg",
    "./assets/favicon.svg",
    "./assets/fonts/Sirelia.otf",
    "./assets/fonts/CourierPrime-Regular.ttf",
    "./assets/fonts/CourierPrime-Italic.ttf",
    "./assets/fonts/CourierPrime-Bold.ttf",
    "./assets/fonts/CourierPrime-BoldItalic.ttf",
    "./assets/favicon-192.png",
    "./assets/favicon-512.png",
    "./assets/favicon-maskable-192.png",
    "./assets/favicon-maskable-512.png",
    "./assets/favicon-apple-touch.png"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(APP_SHELL_CACHE)
        .then(function (cache) {
            return cache.addAll(APP_SHELL_FILES).then(function () {
                return Promise.all(OPTIONAL_FILES.map(function (file) {
                    return cache.add(file).catch(function () {});
                }));
            });
        })
        // Pas de skipWaiting() ici : le nouveau SW attend que la page
        // envoie SKIP_WAITING (bouton « Recharger » du toast de mise à jour).
    );
});

self.addEventListener("message", function (event) {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys()
        .then(function (keys) {
            return Promise.all(
                keys
                .filter(function (key) {
                    return key.indexOf(CACHE_VERSION) !== 0;
                })
                .map(function (key) {
                    return caches.delete(key);
                })
            );
        })
        .then(function () {
            return self.clients.claim();
        })
    );
});

function isAppShellRequest(url) {
    return url.origin === self.location.origin;
}

function handleNavigation(event) {
    event.respondWith(
        fetch(event.request)
        .then(function (response) {
            var copy = response.clone();
            caches.open(APP_SHELL_CACHE).then(function (cache) {
                cache.put("./index.html", copy);
            });
            return response;
        })
        .catch(function () {
            return caches.match("./index.html");
        })
    );
}

function handleAppShellAsset(event) {
    event.respondWith(
        caches.match(event.request).then(function (cached) {
            var networkFetch = fetch(event.request)
                .then(function (response) {
                    if (response && response.status === 200) {
                        var copy = response.clone();
                        caches.open(APP_SHELL_CACHE).then(function (cache) {
                            cache.put(event.request, copy);
                        });
                    }
                    return response;
                })
                .catch(function () {
                    return cached;
                });
            return cached || networkFetch;
        })
    );
}

function handleRuntimeAsset(event) {
    event.respondWith(
        caches.open(RUNTIME_CACHE).then(function (cache) {
            return cache.match(event.request).then(function (cached) {
                var networkFetch = fetch(event.request)
                    .then(function (response) {
                        if (response && response.status === 200) {
                            cache.put(event.request, response.clone());
                        }
                        return response;
                    })
                    .catch(function () {
                        return cached;
                    });
                return cached || networkFetch;
            });
        })
    );
}

self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") return;

    var url = new URL(event.request.url);

    // Ignore les schémas non web (ex. chrome-extension://) : l'API Cache ne les accepte pas.
    if (url.protocol !== "http:" && url.protocol !== "https:") return;

    if (event.request.mode === "navigate") {
        handleNavigation(event);
        return;
    }

    if (isAppShellRequest(url)) {
        handleAppShellAsset(event);
    } else {
        handleRuntimeAsset(event);
    }
});