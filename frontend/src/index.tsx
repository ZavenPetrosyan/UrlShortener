import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";
import AppRoutes from "./routes.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);
