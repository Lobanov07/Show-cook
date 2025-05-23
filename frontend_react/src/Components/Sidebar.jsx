import { useNavigate } from 'react-router-dom';
import '../css/Sidebar.css'

import { useAuth } from './AuthContext';
import { useState, useEffect } from 'react';

export default function Main_menu() {
    const [Auth, setAuth] = useState(false);
    const isAuthenticated = useAuth();

    const navigate = useNavigate()
    
    useEffect(() => {
        if (isAuthenticated) {
                setAuth(true)
        }
        else {setAuth(false)}
      }, [isAuthenticated])


    return (
        <>
        <aside className="sidebar">
      <ul className="menu">
        <button onClick={() => navigate('/features_recipes', {replace: false})}>ИЗБРАННЫЕ РЕЦЕПТЫ</button>
        <button onClick={() => navigate('/team', {replace: false})}>О КОМАНДЕ</button>
        {Auth && (
        <button onClick={() => navigate('/profile', {replace: false})}>АККАУНТ</button>
        )}
        

      </ul>
    </aside>
    </>
    );
}