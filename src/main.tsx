import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Portfolio could not start: #root element not found.");
  const message = document.createElement("p");
  message.setAttribute("role", "alert");
  message.textContent = "The portfolio could not start. Please reload the page.";
  document.body.appendChild(message);
}
