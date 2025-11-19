// import { AppRoutes } from './Routes/AppRoutes.tsx';
// import './App.css';
//   import { ToastContainer } from 'react-toastify';

// function App() {
//   return (
//     <>
//       <ToastContainer />
//       <AppRoutes />
//     </>
//   )
// }

// export default App
// import { AppRoutes } from './Routes/AppRoutes.tsx';
// import './App.css';
// import { ToastContainer } from 'react-toastify';
// import { useAppSelector } from "./app/hooks";

// function App() {
//   const dark = useAppSelector((state) => state.theme.dark);
//   // inside App()
// console.log("App root theme dark:", dark);


//   return (
//     <div className={dark ? "theme-dark" : "theme-light"}>
//       <ToastContainer />
//       <AppRoutes />
//     </div>
//   );
// }

// export default App;
// src/App.tsx
import { useEffect } from "react";
import { useAppSelector } from "./app/hooks";
import { ToastContainer } from "react-toastify";
import { AppRoutes } from "./Routes/AppRoutes";
import './index.css'; // ensure global css imported (if not already)

function App() {
  const dark = useAppSelector((state) => (state as any).theme?.dark);

  // Ensure the theme class is applied to the root html element (covers portals)
  useEffect(() => {
    const cls = dark ? "theme-dark" : "theme-light";
    // apply to <html>
    document.documentElement.classList.remove(dark ? "theme-light" : "theme-dark");
    document.documentElement.classList.add(cls);

    // also apply to body (optional but sometimes useful)
    document.body.classList.remove(dark ? "theme-light" : "theme-dark");
    document.body.classList.add(cls);

    return () => {
      // cleanup optional
    };
  }, [dark]);

  return (
    <div>
      <ToastContainer />
      <AppRoutes />
    </div>
  );
}

export default App;
