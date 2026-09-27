import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App.tsx";
import "./index.css";
import { QuickTradeProvider } from "./lib/quickTrade.tsx";
import { AuthProvider } from "./lib/authStore.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <QuickTradeProvider>
            <App />
          </QuickTradeProvider>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(22, 27, 40, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#dfe2f1",
                backdropFilter: "blur(14px)",
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
