import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { ApiProvider } from "@reduxjs/toolkit/query/react";
import { Api } from "./services/Api.js";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ApiProvider api={Api}>
       <Toaster position="top-center" />
      <App />
    </ApiProvider>
  </BrowserRouter>,
);
