self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Intercettazione delle richieste di rete
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Gestione esclusiva del file inviato dal menu di condivisione dello smartphone
    if (url.pathname === '/scadenziario/ricevi-file-condiviso' && event.request.method === 'POST') {
        event.respondWith(
            (async () => {
                try {
                    const formData = await event.request.formData();
                    const file = formData.get('media');

                    if (file) {
                        const cache = await caches.open('file-condivisi-temporanei');
                        const responseToCache = new Response(file, {
                            headers: {
                                'x-file-name': encodeURIComponent(file.name),
                                'x-file-type': file.type
                            }
                        });
                        await cache.put('/file-in-arrivo', responseToCache);
                    }
                    // Reindirizza l'utente alla home page corretta del repository GitHub
                    return Response.redirect('/scadenziario/?shared=true', 303);
                } catch (error) {
                    return new Response('Errore PWA: ' + error.message, { status: 500 });
                }
            })()
        );
    }
});