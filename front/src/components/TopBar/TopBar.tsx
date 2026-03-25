import './topBar.css';
import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function TopBar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  
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

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="topBar">
      
      <img 
        src="/ball.png" 
        alt="로고" 
        className='ball' 
        onClick={OuterHandleClick} 
        style={{ cursor: 'pointer' }}
      />
      
      
      <input 
        type="text" 
        placeholder="Search..." 
        value={searchTerm}
        onChange={handleSearchChange}
      />
      
      
      {isLoggedIn ? (
        <input 
          type="button" 
          value="로그아웃" 
          onClick={handleLogoutClick} 
        />
      ) : (
        <input 
          type="button" 
          value="로그인" 
          onClick={handleLoginClick} 
        />
      )}
    </div>
  );
  };
  export default TopBar;