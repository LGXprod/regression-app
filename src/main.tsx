import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  ScatterController,
  LineController
} from "chart.js";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  ScatterController,
  LineController,
  Tooltip,
  Legend
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
