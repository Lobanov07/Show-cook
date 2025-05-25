import '../css/Header.css'
import logo from '../img/logo.png'
import { Outlet, useNavigate } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();
    return (
      <>
      <button className='Main-button' onClick={() => navigate('/', {replace: false})}>
        <div className="logo">
        <img src={logo} alt="Show-Cook" />
        <span>SHOW-COOK</span>
      </div>
      </button>
      <Outlet />
      </>
    );
}