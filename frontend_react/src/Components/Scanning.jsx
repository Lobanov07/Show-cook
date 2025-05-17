import '../css/Scanning.css';
import { useState, useRef } from 'react';

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
    let fetchOptions;

    const url = new URL('http://localhost:8000/api/recipes-with-prices/');
    url.searchParams.set('page', pageToFetch); // 👈 Query-параметр

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('sort_by', sortBy);
      if (products.trim()) {
        formData.append('products', products.trim());
      }
      fetchOptions = { method: 'POST', body: formData };
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productList, sort_by: sortBy }),
      };
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        setError(`Произошла ошибка: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      const recipes = data.results || [];

      if (recipes.length === 0) {
        setError('Рецепты не найдены.');
      } else {
        setResults(recipes);
        setPage(pageToFetch);
        setCount(data.count || null);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setError(`Ошибка при обработке запроса: ${e.message}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRecipes(1); // всегда с первой страницы
  };

  const totalPages = count && results.length > 0 ? Math.ceil(count / results.length) : null;

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

      {totalPages && totalPages > 1 && (
        <div className="pagination" style={{ marginTop: '20px' }}>
          <button onClick={() => fetchRecipes(page - 1)} disabled={page <= 1}>
            ◀ Назад
          </button>
          <span style={{ margin: '0 10px' }}>
            Страница {page} из {totalPages}
          </span>
          <button onClick={() => fetchRecipes(page + 1)} disabled={page >= totalPages}>
            Вперёд ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default Scanning;
