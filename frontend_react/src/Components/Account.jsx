import '../css/Account.css'
import { useState } from 'react';
import { useAuth } from './AuthContext';
import Main_menu from './Sidebar';
import { useNavigate } from 'react-router-dom';

export default function Account({active, onChange}) {
    const [Edit, setEdit] = useState('account');
    const { user } = useAuth();
    const navigate = useNavigate()
    return (
        <>
        <div className='flexible_show'>
                <Main_menu />
                </div>
      <div className="user-profile">
        <div className="avatar-section">
          <div className="avatar"></div>
          <p className="username">{user?.username}</p>
        </div>
        <div className="info-section" active={Edit} onChange={(current => setEdit(current))}>
          <p className="info-item">email: <span>avtobus@kak.ru</span></p>
          <p className="info-item">Дата рождения: <span>01.01.1970</span></p>
          <p className="info-item">Номер телефона: <span>-</span></p>
          <button className="edit-button" onClick={() => navigate('/edit_profile', {replace: false})}>ИЗМЕНИТЬ ИНФОРМАЦИЮ</button>
        </div>
      </div>
    </>
    );
  };