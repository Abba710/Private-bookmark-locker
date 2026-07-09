import { render } from "react";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./app.tsx";

render(
  <HashRouter>
    <App />
  </HashRouter>,
  document.getElementById("app")!
);
