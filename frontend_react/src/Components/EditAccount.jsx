import '../css/EditAccount.css'
import { useState } from 'react';

export default function EditAccount () {
  const [avatar, setAvatar] = useState('https://via.placeholder.com/100');
  const [login, setLogin] = useState('USER');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [dob, setDob] = useState('1970-01-01');
  const [phone, setPhone] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== repeatPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    alert(`Данные сохранены:\nЛогин: ${login}\nДата рождения: ${dob}\nТелефон: ${phone}`);
  };

  const handleReset = () => {
    setLogin('User');
    setNewPassword('');
    setRepeatPassword('');
    setDob('1970-01-01');
    setPhone('');
    setAvatar('https://via.placeholder.com/100');
  };

  return (
    <div className="user-info-container">
      <h2 className='NameEdit'>ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ</h2>
      <div className="user-form">
        <div className="avatar-section">
          <img src={avatar} alt="Аватар" />
          <label htmlFor="avatarUpload" className="btn">ИЗМЕНИТЬ ФОТО</label>
          <input type="file" id="avatarUpload" accept="image/*" onChange={handleAvatarChange} hidden />
        </div>
        <form onSubmit={handleSubmit} onReset={handleReset}>
          <label>
            ЛОГИН:
            <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} />
          </label>
          <label>
            НОВЫЙ ПАРОЛЬ:
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </label>
          <label>
            ПОВТОР ПАРОЛЯ:
            <input type="password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} />
          </label>
          <label>
            ДАТА РОЖДЕНИЯ:
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </label>
          <label>
            НОМЕР ТЕЛЕФОНА:
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Не указан" />
          </label>
          <div className="buttons">
            <button type="reset" className="btn cancel">ОТМЕНИТЬ ИЗМЕНЕНИЯ</button>
            <button type="submit" className="btn save">СОХРАНИТЬ ИЗМЕНЕНИЯ</button>
          </div>
        </form>
      </div>
    </div>
  );
};
