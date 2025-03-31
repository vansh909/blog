import React from "react";
import ReactDOM from "react-dom/client"; // ✅ Use createRoot from ReactDOM
import App from "./App";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
