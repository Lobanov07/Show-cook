import '../css/Header.css'
import logo from '../img/logo.png'

export default function Header({active, onChange}) {
    return (
      <>
      <button className='Main-button' isActive={active === 'Main'}
      onClick={() => onChange('Main')}>
        <div className="logo">
        <img src={logo} alt="Show-Cook" />
        <span>SHOW-COOK</span>
      </div>
      </button>
      </>
    );
}