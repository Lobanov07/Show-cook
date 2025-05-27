import { useLocation, useNavigate } from 'react-router-dom';
import '../css/Sidebar.css'
import { useAuth } from './AuthContext';
import Header from './Header';
import AutorButton from './AutorButton';

export default function Main_menu() {
    const { isAuthenticated } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    return (
        <>
        <header className="sidebar">
          <div className='head_flex' style={{position: 'relative'}}>
                    <Header />
          </div>
      <ul className="menu">
        <button onClick={() => navigate('/recipes', {replace: false})}>ПОИСК РЕЦЕПТОВ</button>
        <button onClick={() => navigate('/team', {replace: false})}>О КОМАНДЕ</button>
        {isAuthenticated && (
        <button onClick={() => navigate('/profile', {replace: false})}>АККАУНТ</button>
        )}
      </ul>
      {!isAuthenticated && location.pathname !== '/login' && (
            <AutorButton />)}
    </header>
    </>
    );
}