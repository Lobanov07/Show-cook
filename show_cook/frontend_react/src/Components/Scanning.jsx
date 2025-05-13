import '../css/Scanning.css'
import { useState, useRef } from 'react';

const Scanning = () => {
  const [products, setProducts] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const imageInputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);

    const imageFile = imageInputRef.current.files[0];
    let fetchOptions;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('sort_by', sortBy);
      fetchOptions = {
        method: 'POST',
        body: formData,
      };
    } else {
      const productList = products
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p);

      if (productList.length === 0) {
        setError('Пожалуйста, введите продукты или загрузите фото.');
        return;
      }

      fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: productList,
          sort_by: sortBy,
        }),
      };
    }

    try {
      const response = await fetch('http://localhost:8000/api/recipes-with-prices/', fetchOptions);

      if (!response.ok) {
        setError(`Произошла ошибка: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (!Array.isArray(data) || data.length === 0) {
        setError('Рецепты не найдены.');
      } else {
        setResults(data);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setError(`Ошибка при обработке запроса: ${e.message}`);
    }
  };

  return (
    <div className="container">
      <h1>Найти рецепты по ингредиентам</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="image">Загрузите изображение:</label>
        <input type="file" id="image" accept="image/*" ref={imageInputRef} />

        <label htmlFor="products">Или введите продукты (через запятую):</label>
        <input
          type="text"
          id="products"
          value={products}
          onChange={(e) => setProducts(e.target.value)}
          placeholder="Картофель, Сыр"
        />

        <label htmlFor="sort">Сортировать по:</label>
        <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="price">Цене недостающих продуктов</option>
          <option value="relevance">Релевантности</option>
        </select>

        <button className="find-recipe" type="submit">Найти рецепты</button>
      </form>

      <div className="result">
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {results.map((item, index) => {
          const { recipe, price, relevance } = item;
          return (
            <div className="recipe" key={index}>
              <h3>{recipe.title || recipe.name}</h3>
              <p>Цена недостающих продуктов: {price != null ? `${price.toFixed(2)} ₽` : 'Не найдена'}</p>
              <p>Релевантность: {relevance != null ? `${relevance.toFixed(1)}%` : '—'}</p>
              {recipe.description && <p>{recipe.description}</p>}
              {recipe.link && (
                <p>
                  <a href={recipe.link} target="_blank" rel="noopener noreferrer">
                    Подробнее
                  </a>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Scanning;