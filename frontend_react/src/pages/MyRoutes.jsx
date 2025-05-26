import {Routes, Route, useLocation} from 'react-router-dom'
import RegisterForm from '../Components/Register'
import Autorize from '../Components/Autorization'
import Major from '../Components/Major'
import Account from '../Components/Account'
import EditAccount from '../Components/EditAccount'
import Scanning from '../Components/Scanning'
import Recipes from '../Components/Recipes'
import Header from '../Components/Header'
import Team from '../Components/Creators'
import { useAuth } from '../Components/AuthContext'
import AutorButton from '../Components/AutorButton'
import ProtectedRoute from './ProtectedRoute'
import NotFound from '../Components/NotFound';

export default function MyRoutes() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    
    return (
        <>
        <div className="show-cook">
                <div className='head_flex'>
                    <Header />
                {!isAuthenticated && location.pathname !== '/login' && (
                <AutorButton />)}
                </div>
            </div>
        <Routes>
            <Route path="/" element={<Major />} />
            <Route path="login" element={<Autorize />} />
            <Route path="register" element={<RegisterForm />} />
            <Route path="profile" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="edit_profile" element={<ProtectedRoute><EditAccount /></ProtectedRoute>} />
            <Route path="to_scan" element={<Scanning />} />
            <Route path="features_recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
            <Route path="team" element={<Team />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </>
    )
}