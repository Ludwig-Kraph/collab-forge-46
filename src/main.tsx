import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, unregisterServiceWorker } from "./utils/serviceWorkerRegistration";
import { initPerformanceOptimization } from "./utils/performanceOptimization";

// Initialize performance monitoring and cache management
initPerformanceOptimization();

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA functionality only in production
if (import.meta.env.PROD) {
  registerServiceWorker();
} else {
  // Ensure no stale SW interferes in dev
  unregisterServiceWorker();
}

