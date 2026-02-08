// src/pages/Login.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { useAuthContext } from '@/context/AuthContext';

export default function Login() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Bienvenido</h1>
        <p className="text-gray-600 text-center mb-8">
          Inicia sesión con tu cuenta de Google
        </p>
        
        <GoogleLoginButton />
      </div>
    </div>
  );
}