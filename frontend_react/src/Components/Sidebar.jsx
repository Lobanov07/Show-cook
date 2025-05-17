import '../css/Sidebar.css'

import { useAuth } from './AuthContext';
import { useState, useEffect } from 'react';

export default function Main_menu({active, onChange}) {
    const [Auth, setAuth] = useState(false);
    const isAuthenticated = useAuth();
    
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

        <button isActive={active === 'Features'}
                onClick={() => onChange('Features')}>ИЗБРАННЫЕ РЕЦЕПТЫ</button>
        <button isActive={active === 'Team'}
                onClick={() => onChange('Team')}>О КОМАНДЕ</button>

        {Auth && (
        <button isActive={active === 'Account'}
                onClick={() => onChange('Account')}>АККАУНТ</button>
        )}
        

      </ul>
    </aside>
    </>
    );
}