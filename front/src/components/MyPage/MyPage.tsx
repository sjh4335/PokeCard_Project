import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './MyPage.css';
import axios from 'axios';
import ip from "../../../default.ts"

interface user {
  email: string;
  loginId: string;
  password: string;
  nickname: string;
  profileImgUrl: string
  tier: string;
  createdAt: string;
}

const MyPage = () => {
  const [user, setUser] = useState<user>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<string>();
  const navigate = useNavigate();

  const BASE_URL = `http://${ip}:8080/pokemon/`;

  //이미지 변경시 실행
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImageFile(files[0]);
      setPreviews(URL.createObjectURL(files[0]))
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setUser(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleEditUser = async () => {
    // 유효성 검사 (사진 포함)
    if (!user?.email ||  !user.password || !user.nickname || !user?.profileImgUrl) {
      alert('모든 정보를 입력해주세요.')
      return;
    }

    const formData = new FormData();
    formData.append('email', user.email);
    formData.append('password', user.password);
    formData.append('nickname', user.nickname);
    if (imageFile) {
      formData.append('images', imageFile);
    }

    try {
      const response = await api.post('/api/public/updatemypage', formData)

      if (response.status === 200) {
        alert('유저정보 변경이 완료되었습니다!');
        navigate('/');
      }
    } catch (error) {
      console.error("등록 실패:", error);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const fetchCards = async () => {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      try {
        const response = await api.post('/api/public/mypage');
        setUser(response.data);

      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 404) {
            alert(error.response.data);
            navigate('/');
          } else {
            console.error("기타 로딩 실패:", error);
          }
        }
      }
    };
    fetchCards();
  }, []);

  return (
    <div className="buysell-container">
      <h1 style={{ marginBottom: '30px' }}>내 정보 수정</h1>
      <div className="sell-registration-container">
        <div className="sell-left">
          {previews != null ? (
            <div className="preview-container">
              <img src={previews} className="upload-preview" />
            </div>
          ) : (
            
            <div className="preview-container">
              {user?.profileImgUrl ? (
              <img src={`${BASE_URL}${user?.profileImgUrl}`} className="upload-preview" />
              ) : (
                <p>이미지 불러오는중 ...</p>
              )}
              
            </div>
          )}
        </div>
        <div className="sell-right">
          <div className="form-group">
            <label>프로필 사진 첨부</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginBottom: '10px' }}
            />
          </div>
          <div className="form-group">
            <label>ID</label>
            <label>{user?.loginId}</label>
            <label>이메일 입력</label>
            <input
              type="text"
              name='email'
              placeholder="이메일 입력"
              value={user?.email || ''}
              onChange={handleChange}
            />
            <label>비밀번호 입력</label>
            <input
              type="text"
              name='password'
              placeholder="비밀번호 입력"
              value={user?.password || ''}
              onChange={handleChange}
            />
            <label>닉네임 입력</label>
            <input
              type="text"
              name='nickname'
              placeholder="닉네임 입력"
              value={user?.nickname || ''}
              onChange={handleChange}
            />
          </div>
          <button className="btn-buy" onClick={handleEditUser}>등록</button>
          <button className="btn-sell" onClick={() => navigate(`/`)}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;