import '../css/Sidebar.css'

export default function Main_menu({active, onChange}) {
    return (
        <>
        <aside className="sidebar">
      <ul className="menu">
        <button isActive={active === 'History'}
                onClick={() => onChange('History')}>ИСТОРИЯ ОПЕРАЦИЙ</button>
        <button isActive={active === 'Features'}
                onClick={() => onChange('Features')}>ИЗБРАННЫЕ РЕЦЕПТЫ</button>
        <button isActive={active === 'Team'}
                onClick={() => onChange('Team')}>О КОМАНДЕ</button>
        <button isActive={active === 'Account'}
                onClick={() => onChange('Account')}>АККАУНТ</button>
      </ul>
    </aside>
    </>
    );
}