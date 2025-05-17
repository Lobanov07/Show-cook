import '../css/AutorButton.css'

export default function AutorButton ({active, onChange}) {
    return(
    <>
        <div className="button-container">
        <button className="button_log"  isActive={active === 'Autorization'}
                onClick={() => onChange('Autorization')}>Войти</button>
      </div>
    </>
    )
}