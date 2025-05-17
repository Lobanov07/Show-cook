import '../css/History.css'

export default function History(){
    return (
        <div className='flexible'>
            <div className='bord-title'>
            <h2 className="history-title">ИСТОРИЯ ОПЕРАЦИЙ</h2>
            </div>
        <div className="history-section">
            <ul className='list-history'>
                <li className='font-history'>Сканирование 1</li>
                <li className='font-history'>Сканирование 2</li>
                <li className='font-history'>Сканирование 3</li>
                <li className='font-history'>Сканирование 4</li>
                <li className='font-history'>Сканирование 5</li>
                <li className='font-history'>Сканирование 6</li>
            </ul>
        </div>
        </div>
      );
}