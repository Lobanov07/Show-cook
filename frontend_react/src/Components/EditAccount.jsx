import '../css/EditAccount.css';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import Main_menu from './Sidebar';
import axios from 'axios';

export default function EditAccount() {
  const [avatar, setAvatar] = useState('');
  const [login, setLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();


  // Загрузка данных профиля при монтировании
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile/`, {
          headers: { Authorization: `Token ${token}` },
        });
        console.info('EditAccount: Данные профиля:', response.data);
        setLogin(response.data.username || 'USER');
        setDob(response.data.dateOfBirth || '1970-01-01');
        setPhone(response.data.phoneNumber || '');
        // Аватар пока не загружаем, так как бэкенд его не возвращает
      } catch (err) {
        console.error('EditAccount: Ошибка загрузки профиля:', err.response?.data, err.message);
        alert('Не удалось загрузить данные профиля');
        navigate('/profile', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, token, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword && repeatPassword) {
      if (newPassword !== repeatPassword) {
        alert('Пароли не совпадают!');
        console.info('EditAccount: Пароли не совпадают');
        return;
      }
    }
    setIsLoading(true);
    const formData = new FormData();
    if (avatar) {
      const avatarFile = document.querySelector('#avatarUpload').files[0];
      if (avatarFile) formData.append('avatar', avatarFile);
    }
    formData.append('username', login);
    if (newPassword) formData.append('password', newPassword);
    formData.append('date_of_birth', dob);
    formData.append('phone_number', phone);

    try {
      console.info('EditAccount: Отправка обновленных данных');
      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/users/profile/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.info('EditAccount: Данные обновлены:', response.data);
      alert('Данные успешно сохранены!');
      navigate('/profile', { replace: true });
    } catch (err) {
      console.error('EditAccount: Ошибка обновления профиля:', err.response?.data, err.message);
      const msg = err.response?.data?.detail || 'Ошибка при сохранении данных';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLogin('USER');
    setNewPassword('');
    setRepeatPassword('');
    setDob('1970-01-01');
    setPhone('');
    setAvatar('');
    console.info('EditAccount: Сброс формы');
  };

  if (!isAuthenticated) {
    console.info('EditAccount: Неавторизован, перенаправление на /login');
    return null; // Редирект уже выполнен в useEffect
  }

  return (
    <div className="show-cook">
      <div className="flexible_show">
        <Main_menu />
      </div>
      <div className="user-info-container">
        <h2 className="NameEdit">ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ</h2>
        {isLoading ? (
          <p>Загрузка...</p>
        ) : (
          <div className="user-form">
            <div className="avatar-section">
              <img src={avatar || 'https://via.placeholder.com/100'} alt="Аватар" />
              <label htmlFor="avatarUpload" className="btn">ИЗМЕНИТЬ ФОТО</label>
              <input
                type="file"
                id="avatarUpload"
                accept="image/*"
                onChange={handleAvatarChange}
                hidden
              />
            </div>
            <form onSubmit={handleSubmit} onReset={handleReset}>
              <label>
                ЛОГИН:
                <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} />
              </label>
              <label>
                НОВЫЙ ПАРОЛЬ:
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
              <label>
                ПОВТОР ПАРОЛЯ:
                <input
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </label>
              <label>
                ДАТА РОЖДЕНИЯ:
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </label>
              <label>
                НОМЕР ТЕЛЕФОНА:
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Не указан"
                />
              </label>
              <div className="buttons">
                <button type="reset" className="btn cancel" disabled={isLoading}>
                  ОТМЕНИТЬ ИЗМЕНЕНИЯ
                </button>
                <button type="submit" className="btn save" disabled={isLoading}>
                  {isLoading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ ИЗМЕНЕНИЯ'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}