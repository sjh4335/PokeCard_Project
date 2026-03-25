import '../app.css';
import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';

function TopBar() {
  const navigate = useNavigate();

  
  const [searchTerm, setSearchTerm] = useState(
    sessionStorage.getItem('lastSearch') || ""
  );

  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value); 
    sessionStorage.setItem('lastSearch', value); 
  };

  
  const OuterHandleClick = () => {
    window.location.href='https://pokemoncard.co.kr/cards'; 
  };

  
  const handleLoginClick = () => {
    
    navigate('/Login'); 
  };

  return (
    <div className="TopBar">
      
      <img 
        src="/ball.png" 
        alt="로고" 
        className='Ball' 
        onClick={OuterHandleClick} 
        style={{ cursor: 'pointer' }}
      />
      
      
      <input 
        type="text" 
        placeholder="Search..." 
        value={searchTerm}
        onChange={handleSearchChange}
      />
      
      
      <input 
        type="button" 
        value="로그인" 
        onClick={handleLoginClick} 
      />
    </div>
  );
  };
  export default TopBar;