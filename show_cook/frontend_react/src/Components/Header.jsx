import '../css/Header.css'
import logo from '../img/logo.png'

export default function Header() {
    return (
      <>
        <div className="logo">
        <img src={logo} alt="Show-Cook" />
        <span>SHOW-COOK</span>
      </div>
      <div className="button-container">
        <button className="button_log">Войти</button>
      </div>
      </>
    );
}