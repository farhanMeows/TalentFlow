// src/index.tsx (replace bootstrap)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { seedDatabase } from "./mocks/seed";
import { setupWorker } from "msw/browser";
import { handlers } from "./mocks/handlers";
import { BrowserRouter } from "react-router-dom";

async function startMswIfEnabled() {
  // Enable in dev OR when explicitly enabled by env var in production
  const enableInProd = process.env.REACT_APP_ENABLE_MSW === "true";
  if (process.env.NODE_ENV !== "development" && !enableInProd) return false;

  // setup worker - ensure mockServiceWorker.js is accessible at the site root
  const worker = setupWorker(...handlers);

  // point to the worker file that lives in /public/mockServiceWorker.js
  await worker.start({
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
    onUnhandledRequest: "bypass",
  });

  // seed mock DB only when MSW is running
  await seedDatabase();

  return true;
}

async function bootstrap() {
  try {
    await startMswIfEnabled();
  } catch (err) {
    // log errors but still mount the app (so a failed worker registration doesn't block your UI)
    // you may want to surface this error in dev only
    // eslint-disable-next-line no-console
    console.error("Failed to start MSW:", err);
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </StrictMode>
  );
}

bootstrap();
