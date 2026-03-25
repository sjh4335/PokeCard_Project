import axios from 'axios';

const api = axios.create({
  baseURL: '', // 필요시 baseURL 설정 (현재는 '/api/...'로 상대경로 사용 중)
});

// 요청 인터셉터: 모든 요청에 JWT 토큰을 자동으로 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 등 인증 에러 처리 (필요시)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 401 Unauthorized 에러 발생 시 로그아웃 처리 또는 로그인 페이지로 이동
      localStorage.removeItem('accessToken');
      // window.location.href = '/Login'; // 필요시 주석 해제
    }
    return Promise.reject(error);
  }
);

export default api;
