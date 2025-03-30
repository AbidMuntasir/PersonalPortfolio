import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize the app when DOM is ready
function initApp() {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }
  
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    
    console.log("App successfully rendered");
  } catch (error) {
    console.error("Error rendering app:", error);
  }
}

// Ensure the DOM is fully loaded before rendering
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
