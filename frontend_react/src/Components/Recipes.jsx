import '../css/Recipes.css'
import Main_menu from './Sidebar';

export default function Recipes(){
    return (
        <>
        <div className='flexible_show'>
            <Main_menu />
        </div>
        <div className='flexible'>
            <div className='border-title'>
            <h2 className="recipe-title">ИЗБРАННЫЕ РЕЦЕПТЫ</h2>
            </div>
        <div className="recipes-section">
            <ul className='list-recipes'>
                <li className='font-history'>Рецепт 1</li>
                <li className='font-history'>Рецепт 2</li>
                <li className='font-history'>Рецепт 3</li>
                <li className='font-history'>Рецепт 4</li>
                <li className='font-history'>Рецепт 5</li>
                <li className='font-history'>Рецепт 6</li>
            </ul>
        </div>
        </div>
        </>
      );
}