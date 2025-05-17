import '../css/Account.css'
import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function Account({active, onChange}) {
    const [Edit, setEdit] = useState('account');
    const { user } = useAuth();
    return (
        <>
      <div className="user-profile">
        <div className="avatar-section">
          <div className="avatar"></div>
          <p className="username">{user?.username}</p>
        </div>
        <div className="info-section" active={Edit} onChange={(current => setEdit(current))}>
          <p className="info-item">email: <span>avtobus@kak.ru</span></p>
          <p className="info-item">Дата рождения: <span>01.01.1970</span></p>
          <p className="info-item">Номер телефона: <span>-</span></p>
          <button className="edit-button" isActive={active === 'edit_info'}
                onClick={() => onChange('edit_info')}>ИЗМЕНИТЬ ИНФОРМАЦИЮ</button>
        </div>
      </div>
    </>
    );
  };