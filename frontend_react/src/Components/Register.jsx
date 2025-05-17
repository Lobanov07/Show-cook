import { useState } from "react";
import axios from "axios";
import "../css/Register.css"

export default function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({ username: "", email: "", password: "",  password2: ""});

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
      await axios.post("http://localhost:8000/users/register/", form);
      alert("Вы зарегистрированы! Теперь войдите");
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