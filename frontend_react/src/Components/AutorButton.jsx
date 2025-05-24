import '../css/AutorButton.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext';

export default function AutorButton () {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth();

    return(
    <>
    {!isAuthenticated && (<div className="button-container">
        <button className="button_log" onClick={() => navigate('/login', {replace: false})}>Войти</button>
      </div>)} 
    </>
    )
}