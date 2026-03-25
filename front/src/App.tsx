import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import MainPage from "./components/MainPage";
import Login from './components/Login/Login';
import SignUp from './components/SignUp';
import PwReset from './components/PwReset';


 function App() {   
  return (
    <div>
      <BrowserRouter>
       <AuthProvider>
        <Routes>
          <Route path="/" element={<MainPage />} />        
          <Route path="/Login" element={<Login />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/PwReset" element={<PwReset />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
   
    </div>
  );
};

export default App;
