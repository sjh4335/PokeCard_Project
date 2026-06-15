import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const SellRegistration = () => {
    const [selectedCardId, setSelectedCardId] = useState('');
    const [items, setItems] = useState<MyCard[]>([]);
    const [price, setPrice] = useState('');
    const [contact, setContact] = useState('');
    const [location, setLocation] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const navigate = useNavigate();

    const BASE_URL = `http://${ip}:8080/pokemon/`;

    // 사진 선택 시 실행되는 함수
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

    const handleRegister = async () => {
        // 유효성 검사 (사진 포함)
        if (!selectedCardId || !price || !location || !contact || imageFiles.length === 0) {
            alert('사진을 포함한 모든 정보를 입력해주세요.');
            return;
        }

        // [핵심] JSON 대신 FormData 사용
        const formData = new FormData();
        formData.append('cardId', selectedCardId);
        formData.append('price', price);
        formData.append('contactInfo', contact);
        formData.append('location', location);

        imageFiles.forEach((file) => {
            formData.append('images', file);
        });

        try {
            const response = await api.post('/api/market/register', formData);

            if (response.status === 200) {
                alert('판매 등록이 완료되었습니다!');
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
                const response = await api.get('/api/market/mycard');
                setItems(response.data);
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
                    {/* 실물 사진 미리보기가 있으면 먼저 보여주고, 없으면 공식 이미지를 보여줌 */}
                    {previews.length > 0 ? (
                        <div className="preview-container">
                            {previews.map((src, index) => (
                                <img key={index} src={src} alt={`preview-${index}`} className="upload-preview" />
                            ))}
                        </div>
                    ) : selectedCardId ? (
                        <img
                            src={`${BASE_URL}${items.find(card => String(card.cardId) === String(selectedCardId))?.officialImageUrl}`}
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
                            value={selectedCardId}
                            onChange={(e) => setSelectedCardId(e.target.value)}>
                            <option value="">-- 보유카드 --</option>
                            {items.map(card => (
                                <option key={card.cardNumber} value={card.cardId}>{card.cardNameKo} (#{card.cardNumber})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>가격</label>
                        <input
                            type="number"
                            step="100"
                            placeholder="가격입력"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                        <label>거래장소</label>
                        <input
                            type="text"
                            placeholder="거래장소"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                        <label>연락처</label>
                        <input
                            type="text"
                            placeholder="연락처"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                        />
                    </div>
                    <button className="btn-buy" onClick={handleRegister}>등록</button>
                    <button className="btn-sell" onClick={() => navigate('/buysell')}>취소</button>
                </div>
            </div>
        </div>
    );
};

export default SellRegistration;