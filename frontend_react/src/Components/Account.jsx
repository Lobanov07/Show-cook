import '../css/Account.css'
import { useAuth } from './AuthContext';
import Main_menu from './Sidebar';
import { useNavigate, Navigate} from 'react-router-dom';
import {useState, useEffect} from 'react'
import axios from 'axios'
import avatar from '../img/avatar.jpg'

export default function Account() {
const { isAuthenticated, token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Получение данных пользователя
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const fetchUserData = async () => {
      console.info('Account: Запрос данных пользователя, token:', token);
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setUserData(response.data);
      } catch (err) {
        // alert('Не удалось загрузить данные пользователя');
        const errs = err.response?.data;
        const msg = errs ? JSON.stringify(errs) : 'Не удалось загрузить данные пользователя';
        alert(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, token]);

  const handleLogout = () => {
    logout();
    alert('Вы успешно вышли из аккаунта');
    navigate('/', { replace: true });
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

    return (
        <>
        <div className='show-cook'>
        <div className='flexible_show'>
                <Main_menu />
                </div>
      <div className="user-profile">
        <div className="avatar-section">
          <div className='avatar'>
          <img className="photo" id='box' src={
                  userData?.photo || avatar
                }
                alt="Avatar" />
          </div>
          <p className="username">{userData?.username}</p>

        </div>
        <div className="info-section">
          <p className="info-item">Email: <span>{userData?.email || '-'}</span></p>
          <p className="info-item">Дата рождения: <span>{userData?.date_of_birth || '-'}</span></p>
          <p className="info-item">Номер телефона: <span>{userData?.phone_number || '-'}</span></p>
          <button className="edit-button" onClick={() => navigate('/edit_profile', {replace: false})}>ИЗМЕНИТЬ ИНФОРМАЦИЮ</button>
          <button className="logout-button" onClick={handleLogout}>
            ВЫЙТИ
          </button>
        </div>
      </div>
      </div>
    </>
    );
  };