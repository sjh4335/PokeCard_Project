import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const hasAlerted = useRef(false);

  useEffect(() => {
    if (!isLoggedIn && !hasAlerted.current) {
      hasAlerted.current = true;
      alert('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.');
      setShouldRedirect(true);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    // alert 확인 후에만 Navigate가 작동하도록 함
    if (shouldRedirect) {
      return <Navigate to="/login" state={{ from: location }} replace />; // 로그인 페이지로 리다이렉트하면서 원래 가려던 경로를 state로 전달
    }
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
