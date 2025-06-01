import '../css/Account.css'
import { useAuth } from './AuthContext';
import Main_menu from './Sidebar';
import { useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react'
import axios from 'axios'
import avatar from '../img/avatar.jpg'

export default function Account() {
  const { isAuthenticated, token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Подгружаем данные пользователя при маунте
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/users/profile/', {
          headers: { Authorization: `Token ${token}` },
        });
        setUserData(response.data);
      } catch (err) {
        const errs = err.response?.data;
        alert(errs ? JSON.stringify(errs) : 'Не удалось загрузить данные пользователя');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, token]);

  const handleLogout = () => {
    logout();
    alert('Вы вышли');
    navigate('/', { replace: true });
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Составляем правильный src для <img>:
  // - если userData.photo = null/undefined → показываем локальный avatar
  // - если приходит полный URL (http:// или https://), берём только pathname ("/media/…")
  // - если приходит строка без ведущего "/", добавляем "/media/"
  // - если приходит "/media/…", оставляем как есть
  const getPhotoUrl = () => {
    const raw = userData?.photo?.trim();
    if (!raw) {
      return avatar;
    }

    // Если полный URL, разбираем через конструктор URL и берём только pathname:
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        // Например raw = "http://show-cook.sytes.net/media/profile_photos/abc.jpg"
        const url = new URL(raw);
        return url.pathname; // отбрасываем схему и хост, получаем "/media/…"
      } catch (_) {
        return avatar;
      }
    }

    // Если строка без косого слэша в начале (e.g. "avatars/123.jpg"), делаем "/media/avatars/123.jpg"
    if (!raw.startsWith('/')) {
      return `/media/${raw.replace(/^\/+/, '')}`;
    }

    // Если начинается с "/media/", оставляем как есть:
    if (raw.startsWith('/media/')) {
      return raw;
    }

    // Если, например, "/avatars/123.jpg" (без media/), тоже переведём в "/media/...":
    return `/media/${raw.replace(/^\/+/, '')}`;
  };

  return (
    <div className='show-cook'>
      <div className='flexible_show'>
        <Main_menu />
      </div>

      <div className="user-profile">
        <div className="avatar-section">
          <div className='avatar'>
            <img
              className="photo"
              src={getPhotoUrl()}
              alt="Avatar"
            />
          </div>
          <p className="username">{userData?.username}</p>
        </div>

        <div className="info-section">
          <p className="info-item">
            Email: <span>{userData?.email || '-'}</span>
          </p>
          <p className="info-item">
            Дата рождения: <span>{userData?.date_of_birth || '-'}</span>
          </p>
          <p className="info-item">
            Номер телефона: <span>{userData?.phone_number || '-'}</span>
          </p>
          <button
            className="features_recipes"
            onClick={() => navigate('/features_recipes')}
          >
            ИЗБРАННЫЕ РЕЦЕПТЫ
          </button>
          <button
            className="edit-button"
            onClick={() => navigate('/edit_profile')}
          >
            ИЗМЕНИТЬ ИНФОРМАЦИЮ
          </button>
          <button className="logout-button" onClick={handleLogout}>
            ВЫЙТИ
          </button>
        </div>
      </div>
    </div>
  );
};
