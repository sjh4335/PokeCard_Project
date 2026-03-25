import '../../App.css';
import React, { useState } from 'react';

// 1. 전달받는 Props의 타입을 정의합니다. (숫자나 문자열 모두 가능하도록 설정)
interface CardProps {
  imageNum: string | number;
}

const Card: React.FC<CardProps> = ({ imageNum }) => {
  // 2. useState의 제네릭을 사용하여 상태값의 타입을 명확히 지정합니다.
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  
  // 3. 마우스 이벤트의 타입을 지정합니다. (div 요소에서 발생하는 마우스 이벤트)
  const mouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsHovering(true);
    // nativeEvent를 통해 offsetY, offsetX 값을 가져옵니다.
    setX((event.nativeEvent.offsetY - 150) / 6); 
    setY(-(event.nativeEvent.offsetX - 100) / 3);
  };

  const Reset = () => {
    setIsHovering(false);
    setX(0);
    setY(0);
  };

  return (
    <div className='cardTitle'>
      <div 
        className="card"
        onMouseMove={mouseMove}
        onMouseLeave={Reset}
        onClick={Reset}
        style={{
          transform: `rotateX(${x}deg) rotateY(${y}deg)`,
          transition: isHovering 
            ? 'transform 0.2s ease-out' 
            : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
          backgroundImage: `url(https://cards.image.pokemonkorea.co.kr/data/wmimages/MEGA/M3/M3_${imageNum}.png)`
        }}
      >
        <div 
          className="overlay"
          style={{
            background: `radial-gradient( 
              circle at ${50 - y * 2}% ${50 + x * 2}%, 
              rgba(255, 255, 255, 0.4) 20px, 
              rgba(5, 56, 56, 0) 60%
            )`,
            opacity: isHovering ? 1 : 0
          }}
        />
      </div>
    </div>
  );
};

export default Card;