import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { store } from "./store/store.ts";
import { Provider } from "react-redux";
import { seedDatabase } from "./mocks/seed";
import { setupWorker } from "msw/browser";
import { handlers } from "./mocks/handlers";
import { BrowserRouter } from "react-router-dom";
// import { clearAllData } from "./mocks/seed";

async function bootstrap() {
  // Start MSW and seed DB
  const worker = setupWorker(...handlers);
  await worker.start({ onUnhandledRequest: "bypass" });
  // await clearAllData(); // Clear database before seeding
  await seedDatabase(); // Seeds both jobs and assessments

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
