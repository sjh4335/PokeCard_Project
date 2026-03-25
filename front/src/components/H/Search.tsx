import '../../app.css';


import { useState } from 'react';

export default function Search() {
  const [activeTab, setActiveTab] = useState('카드검색');


  return (
    <section className="search-section">
      
      <div className="search-container">
      
     
      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === '카드검색' ? 'active' : ''}`}
          onClick={() => setActiveTab('카드검색')}
        >
          카드 검색
        </button>
        <button 
          className={`tab ${activeTab === 'QA' ? 'active' : ''}`}
          onClick={() => setActiveTab('QA')}
        >
          Q&A
        </button>
      </div>

      
      <div className="search-box">
        <select className="search-select">
          <option value="all">전체</option>
          <option value="pokemon">포켓몬</option>
          <option value="trainer">트레이너</option>
        </select>
        
        <input 
          type="text" 
          className="search-input" 
          placeholder="카드검색 (포켓몬 이름 혹은 텍스트를 입력하세요)" 
        />
        
        <button className="search-submit-btn">검색</button>
      </div>

      
      <div className="bottom-buttons">
        <button className="btn-red">조건 검색 ∨</button>
        <button className="btn-white">ⓘ 조건 검색이란?</button>
      </div>

    </div>
    </section>
  );
}