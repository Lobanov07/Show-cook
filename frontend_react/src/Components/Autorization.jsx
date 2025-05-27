import { useState } from "react";
import "../css/Autorization.css";
import { useAuth } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Preloader2 from "../pages/Preloader2";
import Header from "./Header";
import AutorButton from "./AutorButton";

export default function Autorize({ active }) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      alert("Заполните все поля");
      return;
    }
    setIsLoading(true);
    try {
  
      const response = await axios.post(
        `/users/login/`,
        credentials
      );
      const { token } = response.data; // Предполагается, что сервер возвращает { token: "..." }
      if (!token) {
        throw new Error("Токен не получен от сервера");
      }
      login(token); // Передаем токен в функцию login
      alert("Вы успешно вошли!");
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Ошибка входа";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

    return(
      <>
      <div className='head_flex' style={{marginTop: '40px'}}>
          <Header />
        </div>
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
            <button isActive={active === 'Reg'}
                onClick={() => navigate('/register', {replace: false})}>Регистрация</button>
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>{isLoading ? <Preloader2 /> : "Войти"}</button>
        </form>
      </div>
    </div>
    </>
    )
}