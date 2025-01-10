import React from "react";
import ReactDOM from "react-dom/client";
import './assets/App.css'; // Add this CSS file for styling
import App from "./App";
import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <ToastContainer />
  </React.StrictMode>,
);
