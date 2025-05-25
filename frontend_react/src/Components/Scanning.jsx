import '../css/Scanning.css';
import { useState, useRef, useEffect } from 'react';
import Main_menu from './Sidebar';
import Preloader1 from '../pages/Preloader1';

const Scanning = () => {
  const [products, setProducts] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(null);
  const imageInputRef = useRef();
  const [previewUrl, setPreviewUrl] = useState(null);
   const [isLoading, setIsLoading] = useState(false);

  // Обработчик изменения файла
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file); // Создаём временный URL для предпросмотра
      setPreviewUrl(url);
    }
  };

  // Обработчик удаления изображения
  const handleImageRemove = () => {
    setPreviewUrl(null); // Очищаем предпросмотр
    imageInputRef.current.value = ''; // Сбрасываем input
  };

  // Очистка URL при размонтировании компонента или удалении изображения
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl); // Освобождаем память
      }
    };
  }, [previewUrl]);
  
  const fetchRecipes = async (pageToFetch = 1) => {
    setIsLoading(true);
    setError('');
    setResults([]);

    const imageFile = imageInputRef.current.files[0];
    let fetchOptions;

    const endpoint = '/api/recipes-with-prices/';
    const baseUrl = process.env.REACT_APP_API_URL
    const apiUrl = `${baseUrl.replace(/\/+$/, '')}${endpoint}`;
  
    const url = new URL(apiUrl);
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
    finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRecipes(1); // всегда с первой страницы
    
  };

  const totalPages = count ? Math.ceil(count / 5) : 1;

  return (
    <>
    <div className='flexible_show'>
            <Main_menu />
        </div>
    <div className="container">
      <h1>Найти рецепты по ингредиентам</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="image">Загрузите изображение:</label>
        <input
            type="file"
            id="image"
            accept="image/*"
            ref={imageInputRef}
            onChange={handleImageChange} // Добавляем обработчик изменения
          />
          {/* Предпросмотр изображения */}
          {previewUrl && (
            <div className="image-preview" style={{ marginTop: '10px' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
              />
              <button
                type="button"
                onClick={handleImageRemove}
                style={{ marginLeft: '10px', color: 'red' }}
              >
                🗑️
              </button>
            </div>
          )}

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
        {isLoading && <Preloader1 />}
        {error && (<p style={{ color: 'red' }}>{error}</p>)}
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
          <button className="button-row" onClick={() => fetchRecipes(page - 1)} disabled={page <= 1}>
            ⮜ Назад
          </button>
          <span style={{ margin: '0 10px' }}>
            Страница {page} из {totalPages}
          </span>
          <button className="button-row" onClick={() => fetchRecipes(page + 1)} disabled={page >= totalPages}>
            Вперёд ⮞
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export default Scanning;
