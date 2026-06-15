import axios from 'axios';

const api = axios.create({
  baseURL: '', // 필요시 baseURL 설정 (현재는 '/api/...'로 상대경로 사용 중)
  withCredentials: true
});

// 요청 인터셉터: 모든 요청에 JWT 토큰을 자동으로 추가
api.interceptors.request.use( // 요청이 시작되기 전에 실행되는 함수
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      // Axios 1.x 이상에서는 config.headers가 AxiosHeaders 객체일 수 있으므로 안전하게 설정
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url} - Token Attached`);
    } else {
      console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url} - No Token`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 등 인증 에러 처리 (필요시)
api.interceptors.response.use( // 응답이 성공적으로 도착했을 때 실행되는 함수
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 401 Unauthorized 에러 발생 시 로그아웃 처리 또는 로그인 페이지로 이동
      sessionStorage.removeItem('accessToken');
      // alert("인증 오류: 로그인 세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요." + sessionStorage.getItem('accessToken'));

      // window.location.href = '/Login'; // 필요시 주석 해제
    }
    return Promise.reject(error);
  }
);

export default api;
