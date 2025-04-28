import { useState } from "react";
import '../css/Autorization.css'

export default function Autorize (){
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Логин:", login, "Пароль:", password);
      };

    return(
        <div className="login-wrapper">
      <div className="login-container">
        <h2 className="login-title">Вход в систему</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="login">Логин</label>
            <input
              id="login"
              type="text"
              placeholder="Введите логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="forgot-password">
            <a href="#">Забыли пароль?</a>
          </div>
          <button type="submit" className="login-button">Войти</button>
        </form>
      </div>
    </div>
    )
}