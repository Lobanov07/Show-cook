// src/components/Scanning.jsx
import React, { useState, useRef } from 'react';
import '../css/Scanning.css';

const Scanning = () => {
  const [products, setProducts] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(null);
  const imageInputRef = useRef();

  const fetchRecipes = async (pageToFetch = 1) => {
    setError('');
    setResults([]);

    const imageFile = imageInputRef.current.files[0];
    const endpoint = `/api/recipes-with-prices/?page=${pageToFetch}`;
    let fetchOptions;

    if (imageFile) {
      // multipart/form-data запрос
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('sort_by', sortBy);
      formData.append('products', products.trim());

      // отладка: выводим все поля FormData в консоль
      for (let [key, val] of formData.entries()) {
        console.log('formData entry:', key, val);
      }

      fetchOptions = {
        method: 'POST',
        body: formData,
      };
    } else {
      // JSON-запрос
      const productList = products
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      if (productList.length === 0) {
        setError('Пожалуйста, введите продукты или загрузите фото.');
        return;
      }

      fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productList, sort_by: sortBy }),
      };
    }

    try {
      const response = await fetch(endpoint, fetchOptions);
      if (!response.ok) {
        setError(`Ошибка сервера: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      const list = data.results || [];

      if (list.length === 0) {
        setError('Рецепты не найдены.');
      } else {
        setResults(list);
        setPage(pageToFetch);
        setCount(data.count ?? null);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setError(`Ошибка при запросе: ${e.message}`);
    }
  };

  const totalPages =
    count && results.length > 0 ? Math.ceil(count / results.length) : 0;

  return (
    <div className="container">
      <h1>Найти рецепты по ингредиентам</h1>

      <div className="form-block">
        <label htmlFor="image">Загрузите изображение:</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          ref={imageInputRef}
        />

        <label htmlFor="products">Или введите продукты (через запятую):</label>
        <input
          type="text"
          id="products"
          value={products}
          onChange={(e) => setProducts(e.target.value)}
          placeholder="Картофель, Сыр"
        />

        <label htmlFor="sort">Сортировать по:</label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="price">Цене недостающих продуктов</option>
          <option value="relevance">Релевантности</option>
        </select>

        <button
          type="button"
          className="find-recipe"
          onClick={() => fetchRecipes(1)}
        >
          Найти рецепты
        </button>
      </div>

      <div className="result">
        {error && <p className="error">{error}</p>}
        {results.map((item, idx) => (
          <div className="recipe" key={idx}>
            <h3>{item.recipe.title || item.recipe.name}</h3>
            <p>
              Цена недостающих:{' '}
              {item.price != null ? `${item.price.toFixed(2)} ₽` : '—'}
            </p>
            <p>
              Релевантность:{' '}
              {item.relevance != null ? `${item.relevance.toFixed(1)}%` : '—'}
            </p>
            {item.recipe.description && <p>{item.recipe.description}</p>}
            {item.recipe.link && (
              <p>
                <a
                  href={item.recipe.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Подробнее
                </a>
              </p>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => fetchRecipes(page - 1)}
            disabled={page <= 1}
          >
            ◀ Назад
          </button>
          <span>
            Страница {page} из {totalPages}
          </span>
          <button
            onClick={() => fetchRecipes(page + 1)}
            disabled={page >= totalPages}
          >
            Вперёд ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default Scanning;
