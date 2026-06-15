import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// 타입 정의
interface AuthContextType {
  isLoggedIn: boolean;
  loginId: string | null;
  login: (token: string, loginId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * JWT의 만료 여부를 확인하는 헬퍼 함수
 */
const isTokenValid = (token: string): boolean => { // 토큰이 유효한지 확인하는 함수
  try {
    const payload = JSON.parse(window.atob(token.split('.')[1])); 
    if (payload.exp) {
      return payload.exp * 1000 > Date.now(); // exp는 초 단위이므로 밀리초로 변환하여 현재 시간과 비교
    }
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * JWT에서 loginId(sub)를 추출하는 헬퍼 함수
 */
const getLoginIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(window.atob(token.split('.')[1]));
    return payload.sub || null;
  } catch (error) {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => { // 로그인 상태와 관련된 상태와 함수를 관리하는 컴포넌트
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') { // SSR (서버사이드렌더링) 환경에서는 window가 없으므로 false로 초기화
      const token = sessionStorage.getItem('accessToken');
      if (token && isTokenValid(token)) {
        return true;
      }
      if (token) sessionStorage.removeItem('accessToken'); // 유효하지 않은 토큰이 있다면 제거
    }
    return false;
  });

  const [loginId, setLoginId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('accessToken');
      if (token && isTokenValid(token)) {
        return getLoginIdFromToken(token); // 모두 유효하면 토큰에서 loginId 추출
      }
    }
    return null;
  });

  useEffect(() => { // 다른 탭에서 로그아웃했을 때 동기화하기 위한 이벤트 리스너
    const syncLogout = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        setIsLoggedIn(false);
        setLoginId(null);
      }
    };
    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, []);

  const login = (token: string, loginId: string) => {
    sessionStorage.setItem('accessToken', token);
    setIsLoggedIn(true);
    setLoginId(loginId);
  };

  const logout = () => {
    sessionStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setLoginId(null);
  };

  return ( // AuthContext.Provider로 로그인 상태와 관련 함수들을 하위 컴포넌트에 제공
    <AuthContext.Provider value={{ isLoggedIn, loginId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => { // AuthContext를 쉽게 사용할 수 있도록 하는 커스텀 훅
  const context = useContext(AuthContext); // useContext를 사용하여 AuthContext의 로그인 상태와 함수들을 가져옴
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};