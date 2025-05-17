import './App.css';
import Sidebar from './Components/Sidebar'
import Header from './Components/Header'
import Major from './Components/Major';

import {useEffect, useState} from 'react';
import { AuthProvider, useAuth } from "./Components/AuthContext";

import Autorize from './Components/Autorization';
import AutorButton from './Components/AutorButton';
import Team from './Components/Creators';
import ToScan from './Components/Scan_button';
import Scanning from './Components/Scanning';
import Recipes from './Components/Recipes';

import Account from './Components/Account';
import EditAccount from './Components/EditAccount';
import RegisterForm from './Components/Register';

export default function App() {
  const [Tab, setTab] = useState('Main')
  const [Auth, setAuth] = useState(false)
  const isAuthenticated = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setAuth(true)
    }
    else {
      setAuth(false)
    }
  }, [isAuthenticated])

  return (
    <>
    <AuthProvider>
      <div className="show-cook">
        <div className='head_flex'>
        <Header active={Tab} onChange={(current => setTab(current))} />
        {!Auth && (
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

          <Autorize active={Tab} onChange={(current => setTab(current))}/>

        )}
        {Tab === 'Features' && (
          <>
            <Sidebar active={Tab} onChange={(current => setTab(current))}/>
            <Recipes />
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

        {Tab === 'Account' && Auth && (

          <>
            <Sidebar active={Tab} onChange={(current => setTab(current))}/>
            <Account active={Tab} onChange={(current => setTab(current))}/>
          </>
        )}
        {Tab === 'edit_info' && (
          <>
            <Sidebar active={Tab} onChange={(current => setTab(current))}/>
            <EditAccount />
          </>
        )}

        {Tab === 'Reg' && (
          <>
            <RegisterForm />
          </>
        )}
        </div>
      </div>
    </AuthProvider>

    </>
  );
}

