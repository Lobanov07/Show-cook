import { useNavigate } from 'react-router-dom';
import '../css/Sidebar.css'
import { useAuth } from './AuthContext';

export default function Main_menu() {
    const { isAuthenticated } = useAuth();

    const navigate = useNavigate()
    return (
        <>
        <aside className="sidebar">
      <ul className="menu">
        <button onClick={() => navigate('/features_recipes', {replace: false})}>ИЗБРАННЫЕ РЕЦЕПТЫ</button>
        <button onClick={() => navigate('/team', {replace: false})}>О КОМАНДЕ</button>
        {isAuthenticated && (
        <button onClick={() => navigate('/profile', {replace: false})}>АККАУНТ</button>
        )}
        

      </ul>
    </aside>
    </>
    );
}