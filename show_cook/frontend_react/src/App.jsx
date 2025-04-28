import './App.css';
import Sidebar from './Components/Sidebar'
import Header from './Components/Header'
import Major from './Components/Major';
import { useState } from 'react';
import Autorize from './Components/Autorization';
import AutorButton from './Components/AutorButton';
import Team from './Components/Creators';
import ToScan from './Components/Scan_button';
import Scanning from './Components/Scanning';

export default function App(active, onChange) {
  const [Tab, setTab] = useState('Main')
  return (
    <>
      <div className="show-cook">
        <div className='head_flex'>
        <Header active={Tab} onChange={(current => setTab(current))} />
        {Tab !== 'Autorization' && (
            <AutorButton active={Tab} onChange={(current => setTab(current))}></AutorButton>
        )}
        </div>
        <div className='flexible_show'>
        {Tab === 'Main' && (
          <>
          <Sidebar active={Tab} onChange={(current => setTab(current))}/>
            <div className='head-flex'>
            <Major active={Tab} onChange={(current => setTab(current))}/>
             <div className='style_button'>
              <ToScan active={Tab} onChange={(current => setTab(current))}/>
          </div>
            </div>
          </>
        )}
        {Tab === 'Autorization' && (
          <Autorize/>
        )}
        {Tab === 'History' && (
          <>
            <Sidebar active={Tab} onChange={(current => setTab(current))}/>
            <Team />
          </>
        )}
        {Tab === 'Features' && (
          <>
            <Sidebar active={Tab} onChange={(current => setTab(current))}/>
            <Team />
          </>
        )}
        {Tab === 'Team' && (
          <>
            <Sidebar active={Tab} onChange={(current => setTab(current))}/>
            <Team />
          </>
        )}
        {Tab === 'Scan' && (
          <>
            <Sidebar active={Tab} onChange={(current => setTab(current))}/>
            <Scanning />
          </>
        )}
        </div>
      </div>
    </>
  );
}

