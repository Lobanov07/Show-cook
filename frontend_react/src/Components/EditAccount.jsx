import '../css/EditAccount.css';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import Main_menu from './Sidebar';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import EmptyPhoto from '../img/avatar.jpg'

export default function EditAccount() {
  const [avatar, setAvatar] = useState('');
  const [userData, setUserData] = useState(null);
  const [login, setLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();


  // Загрузка данных профиля при монтировании
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login', { replace: true });
      return;
    }
    const fetchUserData = async () => {
      console.info('Account: Запрос данных пользователя, token:', token);
      try {
        const response = await axios.get(`/users/profile/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setUserData(response.data);
      } catch (err) {
        alert('Не удалось загрузить данные пользователя');
      }
    };

    fetchUserData();

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/users/profile/`, {
          headers: { Authorization: `Token ${token}` },
        });
        console.info('EditAccount: Данные профиля:', response.data);
        setLogin(response.data.username || 'USER');
        setDob(response.data.date_of_birth || '1970-01-01');
        setPhone(response.data.phone_number || '');
        setAvatar(response.data.photo || '');
      } catch (err) {
        console.error('EditAccount: Ошибка загрузки профиля:', err.response?.data, err.message);
        alert('Не удалось загрузить данные профиля');
        navigate('/profile', { replace: true });
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
    const formData = new FormData();
    if (avatar) {
      const avatarFile = document.querySelector('#avatarUpload').files[0];
      if (avatarFile) formData.append('photo', avatarFile);
    }
    formData.append('username', login);
    if (newPassword) formData.append('password', newPassword);
    formData.append('date_of_birth', dob);
    formData.append('phone_number', phone);

    try {
      console.info('EditAccount: Отправка обновленных данных');
      const response = await axios.patch(`/users/profile/`, formData, {
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
    } 
  };

  const handleReset = () => {
    setLogin(userData?.username);
    setNewPassword('');
    setRepeatPassword('');
    setDob(userData?.date_of_birth);
    setPhone(userData?.phone_number);
    setAvatar(userData?.photo);
    console.info('EditAccount: Сброс формы');
    navigate('/profile', { replace: true });
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
          <div className="user-form">
            <div className="avatar-section">
              <img src={avatar || EmptyPhoto} alt="Аватар" />
              <label htmlFor="avatarUpload" className="btn">ИЗМЕНИТЬ ФОТО</label>
              {avatar && (<button type="button" className="btn_remove-avatar" onClick={() => setAvatar('')}>
                УДАЛИТЬ ФОТО
              </button>)}
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
                <PhoneInput
                  country={'ru'}
                  value={phone}
                  inputClass="Phone-Input"
                  onChange={(phone) => setPhone(phone)}
                  placeholder="Не указан"
                  specialLabel='НОМЕР ТЕЛЕФОНА:'
                />
              </label>
              <div className="buttons">
                <button type="reset" className="btn cancel">
                  ОТМЕНИТЬ ИЗМЕНЕНИЯ
                </button>
                <button type="submit" className="btn save">
                  СОХРАНИТЬ ИЗМЕНЕНИЯ
                </button>
              </div>
            </form>
          </div>
      </div>
    </div>
  );
}