import api from '../api/axios';
import axios from 'axios';
import '../App.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PwReset = () => {
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [nickname, setNickname] = useState('');
    const navigate = useNavigate();

    const handlePwReset = async () => {
        if (pw !== confirmPw) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const response = await api.post('/api/auth/reset-password', {
                username: id,
                newPassword: pw,
                nickname: nickname
            });

            alert(response.data || "비밀번호 초기화 성공");
            navigate('/Login');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data || "비밀번호 초기화 실패");
            } else {
                console.error("알 수 없는 에러:", error);
            }
        }
    };

    return (
        <div className="loginContainer">
            <div className='loginForm' style={{ height: 'auto', padding: '20px' }}>
                <div className="loginTitle">
                    <input 
                        className="loginInput" 
                        onChange={(e) => setId(e.target.value)} 
                        placeholder="ID" 
                    />
                </div>
                <div className="loginTitle">
                    <input 
                        className="loginInput" 
                        type="password"
                        onChange={(e) => setPw(e.target.value)} 
                        placeholder="새 비밀번호" 
                    />
                </div>
                <div className="loginTitle">
                    <input 
                        className="loginInput" 
                        type="password"
                        onChange={(e) => setConfirmPw(e.target.value)} 
                        placeholder="새 비밀번호 확인" 
                    />
                </div>
                <div className="loginTitle">
                    <input 
                        className="loginInput" 
                        onChange={(e) => setNickname(e.target.value)} 
                        placeholder="닉네임 확인" 
                    />
                </div>
                <div>
                    <button className="loginButton" onClick={handlePwReset}>비밀번호 변경</button>
                </div>
            </div>
            <div className='signup'>
                <h6 onClick={() => navigate('/Login')} style={{ cursor: 'pointer' }}>로그인 페이지로 돌아가기</h6>
            </div>
        </div>
    );
};

export default PwReset;
