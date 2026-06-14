import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import './BuySell.css';
import axios from 'axios';
import ip from "../../../default.ts"

interface MyCard {
  cardId: number;
  cardNumber: string;
  cardNameKo: string;
  officialImageUrl: string;
}

interface detailCard {
  listingId: number;
  sellerId: number;
  loginId: number;
  nickname: string;
  cardId: number;
  price: number;
  contactInfo: string;
  location: string;
  cardNameKo: string;
  status: string;
  officialImageUrl: string;
  imageStrings: string[];
  owner: boolean;
}

const SellEdit = () => {
  const { id } = useParams();
  const [item, setItem] = useState<detailCard>();
  const [myCard, setMyCard] = useState<MyCard[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const navigate = useNavigate();

  const BASE_URL = `http://${ip}:8080/pokemon/`;

  //이미지 변경시 실행
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImageFiles(fileArray);

      // 브라우저용 임시 미리보기 URL 생성
      const filePreviews = fileArray.map(file => URL.createObjectURL(file));
      setPreviews(filePreviews);
    }
  };

  //폼 내용 변경시 실행
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setItem(prev => {
      if (!prev) return prev;
      // 가격(price) 필드는 숫자로 변환해서 넣고, 나머지는 문자열 그대로 주입
      const updatedValue = name === 'price' || name === 'cardId' ? Number(value) : value;

      return {
        ...prev,
        [name]: updatedValue 
      };
    });
  };

  //수정내용 등록
  const handleEdit = async () => {
    // 유효성 검사 (사진 포함)
    if (!item?.cardId || !item?.price || !item?.location || !item.contactInfo) {
      alert('모든 정보를 입력해주세요.')
      return;
    }

    const formData = new FormData();
    formData.append('cardId', String(item.cardId));
    formData.append('price', String(item.price));
    formData.append('contactInfo', item.contactInfo);
    formData.append('location', item.location);

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await api.post('/api/market/edit', formData, {
        params: {listingId: id}
      });

      if (response.status === 200) {
        alert('판매글 수정이 완료되었습니다!');
        navigate('/buysell');
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
        const response = await api.get('/api/market/detail', {
          params: { listId: id }
        });
        setItem(response.data);
        const cardResponse = await api.get('/api/market/mycard', {
          params: { listId: id }
        });
        setMyCard(cardResponse.data);
        const existingImages = response.data.imageStrings.map(
          (imgName: string) => `${BASE_URL}${imgName}`
        );
        setPreviews(existingImages);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 404) {
            alert(error.response.data);
            navigate('/buysell');
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
      <h1 style={{ marginBottom: '30px' }}>판매등록</h1>
      <div className="sell-registration-container">
        <div className="sell-left">
          {previews.length > 0 ? (
            <div className="preview-container">
              {previews.map((src, index) => (
                <img key={index} src={src} alt={`preview-${index}`} className="upload-preview" />
              ))}
            </div>
          ) : item?.cardId && myCard.find(card => String(card.cardId) === String(item.cardId))?.officialImageUrl? (
            <img
              src={`${BASE_URL}${myCard.find(card => String(card.cardId) === String(item.cardId))?.officialImageUrl}`}
              alt="Preview"
            />
          ) : (
            <p className="placeholder-text">카드 미리보기 (실물 사진 포함)</p>
          )}
        </div>
        <div className="sell-right">
          <div className="form-group">
            <label>실물 사진 첨부</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ marginBottom: '10px' }}
            />
          </div>
          <div className="form-group">
            <label>Select Card</label>
            <select
              name='cardId'
              value={item?.cardId || ''}
              onChange={handleChange}
            >
              <option value="">-- 보유카드 --</option>
              {myCard.map(card => (
                <option key={card.cardNumber} value={card.cardId}>{card.cardNameKo} (#{card.cardNumber})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>가격</label>
            <input
              type="number"
              step="100"
              name='price'
              placeholder="가격입력"
              value={item?.price || 0}
              onChange={handleChange}
            />
            <label>거래장소</label>
            <input
              type="text"
              name='location'
              placeholder="거래장소"
              value={item?.location || ''}
              onChange={handleChange}
            />
            <label>연락처</label>
            <input
              type="text"
              name='contactInfo'
              placeholder="연락처"
              value={item?.contactInfo || ''}
              onChange={handleChange}
            />
          </div>
          <button className="btn-buy" onClick={handleEdit}>등록</button>
          <button className="btn-sell" onClick={() => navigate(`/buysell/detail/${id}`)}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default SellEdit;