import '../css/Major.css'
import tomyam from '../img/tomyam.png'

    
export default function Major() {
    const spans = [
        { i: 0.5 },
        { i: 0.3 },
        { i: 1.5 },
        { i: 2.5 },
        { i: 0.1 },
        { i: 0.1 },
        { i: 1.5 },
        { i: 1 }
      ];
    return (
        <>
        <div className='tomyam'>
            <span>Сфотографируй ингредиенты и</span>
            <span>получи идеи для приготовления</span>
            <span>вкусных блюд!</span>
            <div id="anima1">
            {spans.map((span, index) => (
                <span
                    key={index}
                    style={{ '--i': span.i }}>
                </span>
            ))}
            </div>
            <img src={tomyam} alt="Tom-yam" />
        </div>
        </>
    );
}