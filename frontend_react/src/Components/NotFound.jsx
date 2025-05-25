import '../css/NotFound.css'
import dish from '../img/404.png'

const NotFound = () => {
  return (
    <div className="error-container">
      <div className="error-text">
        <h1>404: СТРАНИЦА НЕ НАЙДЕНА</h1>
        <p>ЧТОБЫ ВЕРНУТЬСЯ, НАЖМИТЕ НА ЛОГОТИП СВЕРХУ</p>
      </div>

      <div className="petri-wrapper">
        <img src={dish} alt="Petri dish face" className="dish" />
      </div>
    </div>
  );
};

export default NotFound;