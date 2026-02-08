// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import type { AuthContextType } from '@/types/auth';

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  // Función para iniciar sesión con Google
  const signInWithGoogle = async (): Promise<User> => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Puedes guardar información adicional del usuario en Firestore aquí
      // import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
      // import { db } from '@/lib/firebase.config';
      // 
      // const user = result.user;
      // await setDoc(doc(db, 'users', user.uid), {
      //   email: user.email,
      //   displayName: user.displayName,
      //   photoURL: user.photoURL,
      //   createdAt: serverTimestamp()
      // }, { merge: true });
      
      return result.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al iniciar sesión';
      console.error('Error al iniciar sesión:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cerrar sesión';
      console.error('Error al cerrar sesión:', err);
      setError(errorMessage);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  };
};