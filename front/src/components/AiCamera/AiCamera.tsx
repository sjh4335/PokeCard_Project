import { useRef, useState, useEffect } from 'react';
import { runOcrInference, initService } from './OcrService';
import styles from './AiCamera.module.css';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import ip from '../../../default.ts';


const AiCamera = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("모델 로딩 중...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [officialImg, setOfficialImg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const BASE_URL = `http://${ip}:8080/pokemon/`;;

  const TARGET_WIDTH = 400;
  const TARGET_HEIGHT = 558;

  useEffect(() => {
    initService().then(() => {
      setStatus("카메라 준비 완료");
      startCamera();
    });
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 2000 },
          height: { ideal: 3600 },
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus("SYSTEM ONLINE");
      }
    } catch (err) {
      console.error(err);
      setStatus("CAMERA ERROR");
    }
  };

  const handleScanProcess = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    video.pause(); 
    setIsAnalyzing(true);
    setResult(""); 
    setOfficialImg(null); 
    setStatus("DATA SCANNING...");

    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const videoAspect = videoWidth / videoHeight;
    const targetAspect = TARGET_WIDTH / TARGET_HEIGHT;

    let sx, sy, sWidth, sHeight;
    if (videoAspect > targetAspect) {
      sHeight = videoHeight;
      sWidth = videoHeight * targetAspect;
      sx = (videoWidth - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = videoWidth;
      sHeight = videoWidth / targetAspect;
      sx = 0;
      sy = (videoHeight - sHeight) / 2;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImg(base64);

    setTimeout(() => {
      video.play().catch(e => console.error("Video play error:", e));
    }, 800);

    try {
      const results = await runOcrInference(canvas);
      
      if (results && results.length > 0) {
        const extractedText = results.map((item: any) => item.text).join(", ");
        setResult(extractedText);
        setStatus("ANALYSIS COMPLETE. FETCHING DATA...");
        await fetchCardDataFromServer(extractedText);
        
      } else {
        setStatus("RETRY SCAN");
      }
    } catch (error) {
      console.error(error);
      setStatus("SCAN ERROR");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchCardDataFromServer = async (ocrResultText: string) => {
    console.log("현재 세션에 토큰이 있는가?:", sessionStorage.getItem('accessToken'));
    try {
      const token = sessionStorage.getItem('accessToken');
      console.log("AiCamera - Current Token in sessionStorage:", token);

      const response = await api.post('/api/main/ai', 
        { cardNumber: ocrResultText }
      );
      
      const imageUrl = response.data.officialImageUrl;
      
      if (imageUrl) {
        setOfficialImg(`${BASE_URL}${imageUrl}`);
      }
      
      const parts = ocrResultText.split(/,\s*/);
      let foundNumber = "";
      for (const part of parts) {
        const match = part.match(/\d+\/\d+/); // "123/456" 형태의 패턴을 찾음
        if (match) {
          foundNumber = match[0];
          break;
        }
      }
      setSearchTerm(foundNumber || ocrResultText);

      setStatus("CARD DATA RETRIEVED");
      alert(response.data.message || "카드 인식 성공 (프론트)");

    } catch (error: any) {
      console.error("서버 통신 오류:", error);
      const errorMsg = error.response?.data?.message || error.response?.data || "API SERVER ERROR";
      setStatus(errorMsg);
    }
    
    
  };
  const handleImgClick = () => {
    if (searchTerm) {
      navigate('/buysell', { state: { cardNumber: searchTerm } });
    }
  };

  return (
    <div className={styles["pokedex-container"]}>
      <div className={styles["left-panel"]}>
        <div className={styles["status-leds"]}>
          <div className={styles["led"]} style={{backgroundColor: '#ffd93e'}}></div>
          <div className={styles["led"]} style={{backgroundColor: '#3eff3e'}}></div>
        </div>

        <div className={styles.screen}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {isAnalyzing && <div className={styles["scan-line"]}></div>}
        </div>

        <div style={{ marginTop: '30px', width: '100%' }}>
            <button 
              onClick={handleScanProcess}
              disabled={isAnalyzing}
              style={{ 
                padding: '15px 0', fontSize: '18px', fontWeight: 'bold', width: '70%',
                backgroundColor: isAnalyzing ? '#888' : '#ffcb05', 
                color: '#222', border: 'none', borderRadius: '10px', cursor: 'pointer'
              }}
            >
              {isAnalyzing ? "SCANNING..." : "START SCAN"}
            </button>
        </div>
      </div>

      <div className={styles["right-section"]}>
        <h1 className={styles["result-title"]}>POKEMON SCANNER</h1>
        <h4 className={styles["sub-title"]}>하단 공식 이미지 터치 시 장터로 이동됩니다.</h4>

        
        <div style={{ background: '#222', borderRadius: '10px', width: '95%', textAlign: 'left', margin: 'auto', padding: '15px' }}>
          <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>SYSTEM STATUS:</p>
          <p style={{ color: '#3eff3e', fontWeight: 'bold', marginBottom: '20px' }}>{status}</p>
          
          <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>OCR ANALYSIS:</p>
          <h2 style={{ fontSize: '18px', color: '#fff', wordBreak: 'break-all' }}>{result || "---"}</h2>
        </div>

        {officialImg && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#ffcb05', fontWeight: 'bold' }}>POKEDEX OFFICIAL DATA</p>
            <img onClick={handleImgClick} // 이미지 클릭 시 장터 페이지로 이동
              src={officialImg}
              alt="Official Card" 
              style={{ 
                width: '100%', 
                maxWidth: '250px', 
                borderRadius: '15px', 
                boxShadow: '0px 0px 15px rgba(255, 203, 5, 0.5)',
                marginTop: '10px'
              }} 
            />
          </div>
        )}

        {capturedImg && !officialImg && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#888' }}>LAST CAPTURED DATA</p>
            <img src={capturedImg} alt="captured" className="capture-preview" style={{ maxWidth: '150px', borderRadius: '10px' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AiCamera;