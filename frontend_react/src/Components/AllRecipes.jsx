import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Main_menu from "./Sidebar";
import Preloader1 from "../pages/Preloader1";
import '../css/AllRecipes.css'

export default function AllRecipes() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const PAGE_SIZE = 5;

  const fetchRecipes = useCallback(async (pageToFetch = 1, q = "") => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (q) params.append("search", q);
      params.append("page", pageToFetch);
      params.append("page_size", PAGE_SIZE);

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/recipes/?${params.toString()}`
      );

      const list = Array.isArray(data) ? data : data.results || [];
      const total = data.count ?? list.length;

      // Клиентский фильтр по части названия (на всякий случай)
      const filteredList = q
        ? list.filter(r => r.title.toLowerCase().includes(q.toLowerCase()))
        : list;

      if (filteredList.length === 0) {
        setRecipes([]);
        setError("Рецепты не найдены по названию");
      } else {
        setRecipes(filteredList);
        setCount(total);
        setPage(pageToFetch);
        setError("");
      }
    } catch (e) {
      console.error(e);
      setError(`Ошибка сервера: ${e.message || "unknown"}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes(1);
  }, [fetchRecipes]);

  const handleSearch = () => {
    fetchRecipes(1, query.trim());
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <>
      <div className="show-cook">
        <div className="flexible_show">
          <Main_menu />
        </div>
      </div>

      <div className="flexible">
        <div className="border-title">
          <h1 className="recipe-title">Поиск рецептов</h1>
        </div>

        <div className="recipes-section-search">
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Введите название блюда"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
              onKeyDown={e => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <button
              onClick={handleSearch}
              className="finder"
            >
              Найти
            </button>
          </div>

          <div className={`results ${recipes.length === 0 && !loading && !error ? "hidden" : ""}`}>
            {error && (
              <p style={{ color: "red", marginTop: 12, textAlign: "center" }}>{error}</p>
            )}
            {loading && <Preloader1 />}

            {recipes.map((r) => (
              <div className="recipe" key={r.id}>
                <h3>{r.title}</h3>
                {r.description && <p>{r.description}</p>}
                {r.ingredients?.length > 0 && (
                  <>
                    <p style={{ fontStyle: "oblique" }}>Ингредиенты:</p>
                    <ul className="list-recipes-search" style={{ listStyleType: "none", marginRight: 50 }}>
                      {r.ingredients.map((ing, idx) => (
                        <li key={idx}>{ing.ingredient}</li>
                      ))}
                    </ul>
                  </>
                )}
                {r.link && (
                  <a href={r.link} target="_blank" rel="noopener noreferrer">
                    Подробнее
                  </a>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && !loading && !error && (
            <div className="pagination" style={{ marginTop: 25 }}>
              <button
                className="button-row"
                onClick={() => fetchRecipes(page - 1, query.trim())}
                disabled={page <= 1}
              >
                ⮜ Назад
              </button>
              <span className="page">
                Страница {page} из {totalPages}
              </span>
              <button
                className="button-row"
                onClick={() => fetchRecipes(page + 1, query.trim())}
                disabled={page >= totalPages}
              >
                Вперёд ⮞
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
