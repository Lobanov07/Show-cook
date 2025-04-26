import './App.css';
import Sidebar from './Components/Sidebar'
import Header from './Components/Header'
import Major from './Components/Major';

export default function App() {
  return (
    <>
      <div className="show-cook">
        <div className='head_flex'>
        <Header />
        </div>
        <div className='flexible_show'>
          <Sidebar />
          <Major />
        </div>
      </div>
    </>
  );
}

