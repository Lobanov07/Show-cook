import {Routes, Route} from 'react-router-dom'
import RegisterForm from '../Components/Register'
import Autorize from '../Components/Autorization'
import Major from '../Components/Major'
import Account from '../Components/Account'
import EditAccount from '../Components/EditAccount'
import Scanning from '../Components/Scanning'
import Recipes from '../Components/Recipes'
import Header from '../Components/Header'
import Team from '../Components/Creators'
import { useEffect, useState } from 'react'
import { useAuth } from '../Components/AuthContext'
import AutorButton from '../Components/AutorButton'

export default function MyRoutes() {
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
        <div className="show-cook">
                <div className='head_flex'>
                    <Header />
                {Auth && (
                <AutorButton />)}
                </div>
            </div>
        <Routes>
            <Route path="/" element={<Major />} />
            <Route path="login" element={<Autorize />} />
            <Route path="register" element={<RegisterForm />} />
            <Route path="profile" element={<Account />} />
            <Route path="edit_profile" element={<EditAccount />} />
            <Route path="to_scan" element={<Scanning />} />
            <Route path="features_recipes" element={<Recipes />} />
            <Route path="team" element={<Team />} />
        </Routes>
    </>
    )
}