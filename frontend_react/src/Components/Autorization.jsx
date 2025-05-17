import { useState } from "react";
import '../css/Autorization.css'
import axios from "axios";
import { useAuth } from "./AuthContext";

export default function Autorize ({active, onChange}){
    const [credentials, setCredentials] = useState({ username: "", password: "" });
  const { login } = useAuth();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/users/login/", credentials);
      login(res.data.token);
      alert("Вы успешно вошли в аккаунт!");
    } catch (err) {
      const errs = err.response?.data;
      const msg = errs ? JSON.stringify(errs) : "Ошибка регистрации";
      alert(msg);
    }
  };

    return(
        <div className="login-wrapper">
      <div className="login-container">
        <h2 className="login-title">Вход в систему</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="login">Логин</label>
            <input name="username" placeholder="Username" type="username-log" onChange={handleChange} required />
          </div>
          <div className="login-field">
            <label htmlFor="password">Пароль</label>
            <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
          </div>
          <div className="register">
            <a isActive={active === 'Reg'}
                onClick={() => onChange('Reg')}>Регистрация</a>
          </div>
          <button type="submit" className="login-button">Войти</button>
        </form>
      </div>
    </div>
    )
}