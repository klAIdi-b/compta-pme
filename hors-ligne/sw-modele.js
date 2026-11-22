// Fonctionnement hors ligne. Ce modèle est complété à la compilation (vite.config.ts) : la version et la liste de
// tous les fichiers du site y sont inscrites, si bien que chaque publication installe une nouvelle version.
// Seuls les fichiers du site sont mis en cache ; aucune donnée d'élève ne transite ici.
const VERSION = '__VERSION__';
const FICHIERS = __FICHIERS__;
// Le nom du cache contient le dossier du site : la version publiée et la version d'essai (sous-dossier essai/) ont
// chacune leur cache, et aucune n'efface celui de l'autre.
const PREFIXE = `compta-pme-${new URL(self.registration.scope).pathname}-`;
const CACHE = `${PREFIXE}${VERSION}`;
/** La version d'essai ne touche jamais aux caches de l'ancien format, qui appartiennent au site principal. */
const ESSAI = new URL(self.registration.scope).pathname.endsWith('/essai/');
/** Caches des versions précédentes de ce même site (et ancien format sans dossier, pour le site principal). */
const ancien = (n) => n !== CACHE && (n.startsWith(PREFIXE) || (!ESSAI && /^compta-pme-[0-9a-f]{12}$/.test(n)));

// Installation : tout le site est mis en cache d'un coup (y compris les modules chargés à la demande, PDF compris).
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(FICHIERS))
      .then(() => self.skipWaiting()),
  );
});

// Activation : les caches des versions précédentes sont supprimés.
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((noms) => Promise.all(noms.filter(ancien).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  // Fichiers compilés (nom avec empreinte, jamais modifiés) : le cache d'abord.
  if (url.pathname.includes('/assets/')) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req)));
    return;
  }
  // Pages et autres fichiers : le réseau d'abord, pour voir tout de suite une nouvelle version ; le cache hors ligne.
  e.respondWith(
    fetch(req)
      .then((rep) => {
        if (rep.ok) {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put(req, copie));
        }
        return rep;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html') || caches.match('./'))),
  );
});
