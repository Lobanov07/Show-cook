import '../css/AutorButton.css'
import { useNavigate } from 'react-router-dom'

export default function AutorButton () {
    const navigate = useNavigate()
    return(
    <>
        <div className="button-container">
        <button className="button_log" onClick={() => navigate('/login', {replace: false})}>Войти</button>
      </div>
    </>
    )
}