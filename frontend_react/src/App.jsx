import './App.css';
import { AuthProvider } from "./Components/AuthContext";
import MyRoutes from './pages/MyRoutes';

export default function App() {
  return (
    <>
    <AuthProvider>
      <MyRoutes />
    </AuthProvider>
    </>
  );
}

