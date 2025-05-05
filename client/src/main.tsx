import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";

// Simple test app without authentication
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">HackMap Test Page</h1>
      <p className="mb-4">This is a simple test page to debug the application.</p>
      <div className="p-4 bg-gray-100 rounded-md">
        If you can see this, the basic React setup is working!
      </div>
    </div>
  </QueryClientProvider>
);
