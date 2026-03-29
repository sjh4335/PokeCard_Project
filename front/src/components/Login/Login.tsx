import api from '../../api/axios';
import axios from 'axios';
import './Login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Login = () => {
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async () => {
        try {
            const response = await api.post('/api/public/login', { // post로 id,pw를 보내고 await으로 답장을 기다림, 응답을 response에 담음
                username: id,
                password: pw
            });

            // 서버가 준 토큰을 저장 (이후 요청 시마다 꺼내 씀)
            const token = response.data.token;
            login(token);
            
            alert((response.data).message || "로그인 성공"); //만약 응답에 백엔드 메세지가 있으면 그걸 출력 아니면 로그인 성공
            navigate('/'); // 로그인 성공 후 메인 페이지로 이동
        } catch (error) {
        // error가 axios에서 발생한 에러인지 확인
        if (axios.isAxiosError(error)) {
            // 이제 error.response에 안전하게 접근 가능합니다.
            const message = error.response?.data || "로그인 실패";
            alert(message);
            
        } else {
            // axios 에러가 아닌 일반적인 런타임 에러 처리
            console.error("알 수 없는 에러:", error);
        }
      }
    };

    return (
      <div className="loginContainer">

        <div className='loginForm'>

          <div className="loginTitle">
            <input className="loginInput" onChange={(e) => setId(e.target.value)} placeholder="ID" />
          </div>
          <div><button className="loginButton"onClick={handleLogin}>로그인</button></div>
          <div className='pwForm'> <input className="loginPw" type="password" onChange={(e) => setPw(e.target.value)} placeholder="PW" /></div>

        </div>
          <div className='signup'><h6 onClick={() => navigate('/SignUp')} style={{ cursor: 'pointer' }}>회원가입이 필요하신가요?</h6><h6>&nbsp;|&nbsp;</h6>
          <h6 onClick={() => navigate('/PwReset')} style={{ cursor: 'pointer' }}>비밀번호 초기화</h6></div>

     </div>
        
    );
};

export default Login;