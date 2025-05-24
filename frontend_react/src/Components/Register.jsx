import { useState } from "react";
import axios from "axios";
import "../css/Register.css"
import { useNavigate } from "react-router-dom";

export default function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({ username: "", email: "", password: "",  password2: ""});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      alert("Пароли не совпадают");
      return;
    }
    try {
      const endpoint = '/users/register/';
      const baseUrl = process.env.REACT_APP_API_URL
      const apiUrl = `${baseUrl.replace(/\/+$/, '')}${endpoint}`;
      await axios.post(apiUrl, form);
      alert("Вы зарегистрированы! Теперь войдите");
      navigate('/login', {replace: false});
    } catch (err) {
      const errs = err.response?.data;
      const msg = errs ? JSON.stringify(errs) : "Ошибка регистрации";
      alert(msg);
    }
  };


  return (
    <div className="register-wrapper">
        <div className="register-container">
            <form onSubmit={handleSubmit}>
            <h2 className="register-title">Регистрация</h2>
            <div className="login-field">
            <label htmlFor="username">Имя пользователя</label>
      <input name="username" placeholder="Username" type="username" onChange={handleChange} required />
            <label htmlFor="Email">Почта</label>
      <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
            <label htmlFor="password">Пароль</label>
      <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
            <label htmlFor="password2">Подтверждение пароля</label>
      <input name="password2" placeholder="Password" type="password" onChange={handleChange} required />
      </div>
      <button type="submit" className="reg-button">Зарегистрироваться</button>
    </form>
    </div>
    </div>
  );
}