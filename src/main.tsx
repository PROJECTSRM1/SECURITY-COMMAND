
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider, useSelector } from "react-redux";
import { store } from "./app/store.ts";
import { BrowserRouter } from "react-router-dom";

import "@ant-design/v5-patch-for-react-19";
import "./index.css";

/* expose store for console debugging (optional) */
(window as any).store = store;

function ThemeWatcher({ children }: { children: React.ReactNode }) {
  type RootState = ReturnType<typeof store.getState>;
  const dark = useSelector((s: RootState) => s.theme?.dark);


useEffect(() => {
  console.log("ThemeWatcher running — dark:", dark);
  const html = document.documentElement;
  const root = document.getElementById("root");
  const body = document.body;

  if (dark) {
    html.classList.add("theme-dark");
    html.classList.remove("theme-light");
    body.classList.add("theme-dark");
    body.classList.remove("theme-light");
    root?.classList.add("theme-dark");
    root?.classList.remove("theme-light");
  } else {
    html.classList.add("theme-light");
    html.classList.remove("theme-dark");
    body.classList.add("theme-light");
    body.classList.remove("theme-dark");
    root?.classList.add("theme-light");
    root?.classList.remove("theme-dark");
  }
}, [dark]);

  return <>{children}</>;
}


createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Provider store={store}>
      <ThemeWatcher>
        <App />
      </ThemeWatcher>
    </Provider>
  </BrowserRouter>
);
