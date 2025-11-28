// Service Worker registration for PWA offline support with safe update flow

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    let refreshing = false;

    // Reload the page once when the new SW takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    window.addEventListener('load', async () => {
      try {
        // Clear old service workers and caches first
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        // Now register fresh
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered: ', registration);

        const activateImmediately = (sw: ServiceWorker | null | undefined) => {
          if (!sw) return;
          sw.postMessage({ type: 'SKIP_WAITING' });
        };

        // If there's an updated SW waiting, activate it right away
        if (registration.waiting) {
          activateImmediately(registration.waiting);
        }

        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          const newSW = registration.installing;
          if (!newSW) return;
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, activate immediately
              activateImmediately(registration.waiting || newSW);
            }
          });
        });

        // Check for updates periodically and when tab becomes visible
        const checkForUpdate = () => registration.update();
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForUpdate();
        });
        setInterval(checkForUpdate, 5 * 60 * 1000); // every 5 minutes
      } catch (error) {
        console.log('SW registration failed: ', error);
      }
    });
  }
};

export const unregisterServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
};
