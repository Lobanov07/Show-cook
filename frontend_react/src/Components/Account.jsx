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

  // Получение данных пользователя
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const fetchUserData = async () => {
      console.info('Account: Запрос данных пользователя, token:', token);
      setIsLoading(true);
      try {
        const response = await axios.get('/users/profile/', {
          headers: { Authorization: `Token ${token}` },
        });
        setUserData(response.data);
      } catch (err) {
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

  // Сборка корректного URL для аватарки:
  // 1) Если userData.photo отсутствует — возвращаем локальный avatar (static).
  // 2) Если userData.photo начинается с "http://" или "https://", извлекаем pathname,
  //    чтобы получить относительный путь в формате "/media/…".
  // 3) Если приходит просто "avatars/123.jpg" (без /media/), добавляем префикс "/media/".
  // 4) Если уже приходит "/media/avatars/123.jpg", используем как есть.
  const getPhotoUrl = () => {
    if (!userData?.photo) {
      return avatar;
    }

    const raw = userData.photo.trim();

    // Если полный URL (http:// или https://), берём только pathname
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        const url = new URL(raw);
        // Вернёт, например, "/media/profile_photos/abc123.jpg"
        return url.pathname;
      } catch (_) {
        // Если по какой-то причине URL не парсится, fallback к локальному avatar
        return avatar;
      }
    }

    // Если приходит относительный путь без ведущего слэша
    if (!raw.startsWith('/')) {
      // Если пропущен просто "avatars/123.jpg", считаем: "/media/" + raw
      return `/media/${raw.replace(/^\/+/, '')}`;
    }

    // Если уже с ведущим слэшем: может быть "/media/..." или "/avatars/...".
    // Если начинается с "/media/", оставляем как есть.
    if (raw.startsWith('/media/')) {
      return raw;
    }

    // Если, например, "/avatars/123.jpg" (не по MEDIA_URL), тоже добавляем /media/ спереди:
    return `/media/${raw.replace(/^\/+/, '')}`;
  };

  return (
    <>
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
              onClick={() => navigate('/features_recipes', { replace: false })}
            >
              ИЗБРАННЫЕ РЕЦЕПТЫ
            </button>
            <button
              className="edit-button"
              onClick={() => navigate('/edit_profile', { replace: false })}
            >
              ИЗМЕНИТЬ ИНФОРМАЦИЮ
            </button>
            <button className="logout-button" onClick={handleLogout}>
              ВЫЙТИ
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
