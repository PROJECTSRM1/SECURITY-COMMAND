import { useEffect } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from '../../pages/login/LoginPage';
import { getUserDetails } from '../../utils/helpers/storage';

export const NonSecureRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userData: any = getUserDetails('userData');
    const currentPath = window.location.pathname;

    if (userData && !currentPath.startsWith('/app')) {
      navigate('/app/dashboard');
    } else if (!userData && (currentPath === '/' || currentPath === '')) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
};
 