const CACHE_PREFIX = "miroon-workstation-";
const CACHE_NAME = `${CACHE_PREFIX}core-v01-20260727`;

const WORKSTATION_ASSETS = [
  "/assets/live2d/core/live2dcubismcore.min.js",
  "/assets/live2d/miro/v01/Miro_Core_v01.model3.json",
  "/assets/live2d/miro/v01/Miro_Core_v01.moc3",
  "/assets/live2d/miro/v01/Miro_Core_v01.2048/texture_00.png",
  "/assets/live2d/shaders/fragshadersrcalphablend.frag",
  "/assets/live2d/shaders/fragshadersrccolorblend.frag",
  "/assets/live2d/shaders/fragshadersrccopy.frag",
  "/assets/live2d/shaders/fragshadersrcmaskinvertedpremultipliedalpha.frag",
  "/assets/live2d/shaders/fragshadersrcmaskpremultipliedalpha.frag",
  "/assets/live2d/shaders/fragshadersrcpremultipliedalpha.frag",
  "/assets/live2d/shaders/fragshadersrcpremultipliedalphablend.frag",
  "/assets/live2d/shaders/fragshadersrcsetupmask.frag",
  "/assets/live2d/shaders/vertshadersrc.vert",
  "/assets/live2d/shaders/vertshadersrcblend.vert",
  "/assets/live2d/shaders/vertshadersrccopy.vert",
  "/assets/live2d/shaders/vertshadersrcmasked.vert",
  "/assets/live2d/shaders/vertshadersrcsetupmask.vert",
  "/assets/workstation/miro-static.png",
  "/assets/workstation/workstation-background.webp",
];

const assetPaths = new Set(WORKSTATION_ASSETS);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(WORKSTATION_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !assetPaths.has(url.pathname)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    }),
  );
});
