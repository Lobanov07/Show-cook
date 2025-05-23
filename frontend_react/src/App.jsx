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
import MyRoutes from './pages/MyRoutes';

export default function App() {
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
      <MyRoutes />
    </AuthProvider>
    </>
  );
}

