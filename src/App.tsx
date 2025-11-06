import { AppRoutes } from './Routes/AppRoutes.tsx';
import './App.css';
  import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <ToastContainer />
      <AppRoutes />
    </>
  )
}

export default App